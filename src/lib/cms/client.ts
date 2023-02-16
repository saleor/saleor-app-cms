import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { SettingsApiResponse } from "../../pages/api/settings";
import { providersSchema, cmsProviders } from ".";
import { transformSettingsIntoConfig } from "./utils";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

// todo: add support for multiple providers at once
export const createCmsClient = async (context: WebhookContext) => {
  const host = context.baseUrl;
  const saleorApiUrl = context.authData.saleorApiUrl;
  const token = context.authData.token;

  const response = await fetch(`${host}/api/settings`, {
    headers: [
      ["content-type", "application/json"],
      [SALEOR_API_URL_HEADER, saleorApiUrl],
      [SALEOR_AUTHORIZATION_BEARER_HEADER, token],
    ],
  });

  const result = (await response.json()) as SettingsApiResponse;

  if (!result.success) {
    throw new Error("The provider was not recognized.");
  }

  const settings = result.data ?? [];

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

    default: {
      throw new Error("The provider was not recognized.");
    }
  }
};
