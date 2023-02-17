import {
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_API_URL_HEADER,
  SALEOR_DOMAIN_HEADER,
} from "@saleor/app-sdk/const";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { cmsProviders } from ".";
import { SettingsApiResponse } from "../../pages/api/settings";
import { providersSchema } from "./config";
import { transformSettingsIntoConfig } from "./utils";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

// todo: add support for multiple providers at once
export const createCmsClient = async (context: WebhookContext) => {
  const host = context.baseUrl;
  const saleorApiUrl = context.authData.saleorApiUrl;
  const token = context.authData.token;

  console.log(host, saleorApiUrl, token);

  const response = await fetch(`${host}/api/settings`, {
    headers: [
      ["content-type", "application/json"],
      [SALEOR_API_URL_HEADER, saleorApiUrl],
      [SALEOR_AUTHORIZATION_BEARER_HEADER, token],
    ],
  });

  console.log("createCmsClient", response);

  const result = JSON.parse(await response.json()) as SettingsApiResponse;

  console.log("createCmsClient", result);

  if (!result.success) {
    throw new Error("The provider was not recognized.");
  }

  console.log("createCmsClient", result.data);

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

    case "datocms": {
      return cmsProviders.datocms.create(config.datocms);
    }

    default: {
      throw new Error("The provider was not recognized.");
    }
  }
};
