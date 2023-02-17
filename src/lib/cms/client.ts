import {
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_API_URL_HEADER,
  SALEOR_DOMAIN_HEADER,
} from "@saleor/app-sdk/const";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { cmsProviders } from ".";
import { SettingsApiResponse } from "../../pages/api/settings";
import { createClient } from "../graphql";
import { createSettingsManager } from "../metadata";
import { getSettings } from "../settings";
import { providersSchema } from "./config";
import { transformSettingsIntoConfig } from "./utils";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

// todo: add support for multiple providers at once
export const createCmsClient = async (context: WebhookContext) => {
  const host = context.baseUrl;
  const saleorApiUrl = context.authData.saleorApiUrl;
  const token = context.authData.token;

  console.log(host, saleorApiUrl, token);

  const client = createClient(saleorApiUrl, async () => ({
    token: token,
  }));

  const settingsManager = createSettingsManager(client);

  const settings = await getSettings(settingsManager);

  console.log("createCmsClient", settings);

  const enabledSetting = settings.find(
    (item) => item.key.includes("enabled") && item.value === "true"
  );
  const provider = enabledSetting?.key.split(".")?.[0];

  const baseConfig = transformSettingsIntoConfig(settings);
  const validation = providersSchema.safeParse(baseConfig);

  if (!validation.success) {
    throw new Error(validation.error.message);
  }

  const config = validation.data;

  switch (provider) {
    case "strapi": {
      return cmsProviders.strapi.create(config.strapi);
    }

    case "contentful": {
      return cmsProviders.contentful.create(config.contentful);
    }

    case "datocms": {
      return cmsProviders.datocms.create(config.datocms);
    }

    default: {
      throw new Error("The provider was not recognized.");
    }
  }
};
