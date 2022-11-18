import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { SettingsApiResponse } from "../../pages/api/settings";
import { contentfulClient, strapiClient } from "./adapters";
import { CMSProvider } from "./config";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

// todo: add support for multiple adapters at once

export const createCmsClient = async (context: WebhookContext) => {
  const host = context.baseUrl;
  const domain = context.authData.domain;
  const token = context.authData.token;
  const response = await fetch(`${host}/api/settings`, {
    headers: [
      ["content-type", "application/json"],
      [SALEOR_DOMAIN_HEADER, domain],
      [SALEOR_AUTHORIZATION_BEARER_HEADER, token],
    ],
  });

  const result = (await response.json()) as SettingsApiResponse;

  if (!result.success) {
    throw new Error("The provider was not recognized.");
  }

  const provider: CMSProvider | string | undefined = result.data?.find(
    (setting) => setting.value === "true"
  )?.key;

  switch (provider) {
    case "strapi": {
      return strapiClient;
    }

    case "contentful": {
      return contentfulClient;
    }

    default: {
      throw new Error("The provider was not recognized.");
    }
  }
};
