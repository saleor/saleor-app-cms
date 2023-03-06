import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { createClient } from "../../graphql";
import { createSettingsManager } from "../../metadata";
import { createCmsKeyForSaleorItem } from "./metadata";
import { getEnabledProviderInstancesFromChannelSettingsList, getOperationType } from "./operations";
import {
  getChannelsSettings,
  getProductVariantChannelsSettings,
  getProviderInstancesSettings,
} from "./settings";
import { CMSSchemaChannels, CMSSchemaProviderInstances, providersSchemaSet } from "../config";
import cmsProviders, { CMSProvider } from "../providers";
import { CmsClientOperations } from "../types";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

// todo: add support for multiple providers at once
export const createCmsClientsOperations = async ({
  context,
  channelsToUpdate,
  cmsKeysToUpdate,
}: {
  context: WebhookContext;
  channelsToUpdate?: string[] | null;
  cmsKeysToUpdate?: string[] | null;
}) => {
  const host = context.baseUrl;
  const saleorApiUrl = context.authData.saleorApiUrl;
  const token = context.authData.token;

  const client = createClient(saleorApiUrl, async () => ({
    token: token,
  }));

  const settingsManager = createSettingsManager(client);

  const channelsSettingsParsed = await getChannelsSettings(settingsManager);
  const providerInstancesSettingsParsed = await getProviderInstancesSettings(settingsManager);

  console.log("cmsKeysToUpdate", cmsKeysToUpdate);

  const productVariantChannelsSettings = await getProductVariantChannelsSettings({
    channelsSettingsParsed,
    channelsToUpdate,
    cmsKeysToUpdate,
  });

  console.log("productVariantChannelsSettings", productVariantChannelsSettings);

  if (
    !productVariantChannelsSettings.toCreate.length &&
    !productVariantChannelsSettings.toUpdate.length &&
    !productVariantChannelsSettings.toRemove.length
  ) {
    // todo: use instead: throw new Error("The channel settings were not found.");
    // continue with other provider instances
    return [];
  }

  const providerInstancesWithProductVariantToCreate =
    getEnabledProviderInstancesFromChannelSettingsList(productVariantChannelsSettings.toCreate);
  const providerInstancesWithProductVariantToUpdate =
    getEnabledProviderInstancesFromChannelSettingsList(productVariantChannelsSettings.toUpdate);
  const providerInstancesWithProductVariantToRemove =
    getEnabledProviderInstancesFromChannelSettingsList(productVariantChannelsSettings.toRemove);

  console.log(
    "providerInstancesWithProductVariantToCreate",
    providerInstancesWithProductVariantToCreate
  );
  console.log(
    "providerInstancesWithProductVariantToUpdate",
    providerInstancesWithProductVariantToUpdate
  );
  console.log(
    "providerInstancesWithProductVariantToRemove",
    providerInstancesWithProductVariantToRemove
  );

  const providerInstancesWithProductVariantToAlter = [
    ...providerInstancesWithProductVariantToCreate,
    ...providerInstancesWithProductVariantToUpdate,
    ...providerInstancesWithProductVariantToRemove,
  ];

  const enabledProviderInstancesSettings = Object.values(providerInstancesSettingsParsed).filter(
    (providerInstance) => providerInstancesWithProductVariantToAlter.includes(providerInstance.id)
  );

  console.log("enabledProviderInstancesSettings", enabledProviderInstancesSettings);

  const clientsOperations = enabledProviderInstancesSettings.reduce<CmsClientOperations[]>(
    (acc, providerInstanceSettings) => {
      const provider = cmsProviders[
        providerInstanceSettings.providerName as CMSProvider
      ] as typeof cmsProviders[keyof typeof cmsProviders];

      const validation =
        providersSchemaSet[providerInstanceSettings.providerName as CMSProvider].safeParse(
          providerInstanceSettings
        );

      if (!validation.success) {
        // todo: use instead: throw new Error(validation.error.message);
        // continue with other provider instances
        console.error(validation.error.message);

        return acc;
      }

      const config = validation.data;

      if (provider) {
        return [
          ...acc,
          {
            cmsProviderInstanceId: providerInstanceSettings.id,
            // todo: fix validation to not pass config as any
            operations: provider.create(config as any), // config without validation = providerInstanceSettings as any
            operationType: getOperationType({
              providerInstancesWithCreateOperation: providerInstancesWithProductVariantToCreate,
              providerInstancesWithUpdateOperation: providerInstancesWithProductVariantToUpdate,
              providerInstancesWithRemoveOperation: providerInstancesWithProductVariantToRemove,
              providerInstanceId: providerInstanceSettings.id,
            }),
          },
        ];
      }
      return acc;
    },
    [] as CmsClientOperations[]
  );

  return clientsOperations;
};
