import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { createClient } from "../graphql";
import { createSettingsManager } from "../metadata";
import { CMSSchemaChannels, CMSSchemaProviderInstances, providersSchemaSet } from "./config";
import cmsProviders, { CMSProvider } from "./providers";
import { CmsClientOperations } from "./types";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

// todo: add support for multiple providers at once
export const createCmsClientInstances = async (
  context: WebhookContext,
  channel?: string | null
) => {
  const host = context.baseUrl;
  const saleorApiUrl = context.authData.saleorApiUrl;
  const token = context.authData.token;

  const client = createClient(saleorApiUrl, async () => ({
    token: token,
  }));

  const settingsManager = createSettingsManager(client);

  const channelsSettings = await settingsManager.get("channels");
  const channelsSettingsParsed: CMSSchemaChannels =
    channelsSettings && JSON.parse(channelsSettings);

  const providerInstancesSettings = await settingsManager.get("providerInstances");
  const providerInstancesSettingsParsed: CMSSchemaProviderInstances =
    providerInstancesSettings && JSON.parse(providerInstancesSettings);

  const singleChannelSettings = channelsSettingsParsed[channel || "default"];

  if (!singleChannelSettings) {
    throw new Error("The channel settings were not found.");
  }

  const { enabledProviderInstances } = singleChannelSettings;

  const enabledProviderInstancesSettings = Object.values(providerInstancesSettingsParsed).filter(
    (providerInstance) => enabledProviderInstances.includes(providerInstance.id)
  );

  const clientInstances = enabledProviderInstancesSettings.reduce<CmsClientOperations[]>(
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
          },
        ];
      }
      return acc;
    },
    [] as CmsClientOperations[]
  );

  return clientInstances;
};
