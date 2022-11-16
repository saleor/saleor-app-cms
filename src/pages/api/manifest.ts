import { AppManifest } from "@saleor/app-sdk/types";
import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

import packageJson from "../../../package.json";
import { productUpdatedWebhook } from "./webhooks/product-updated";
import { productCreatedWebhook } from "./webhooks/product-created";
import { productDeletedWebhook } from "./webhooks/product-deleted";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: packageJson.name,
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_PRODUCTS"],
      id: "saleor.app",
      version: packageJson.version,
      webhooks: [
        productUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
        productCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        productDeletedWebhook.getWebhookManifest(context.appBaseUrl),
      ],
      extensions: [
        {
          label: "CMS Hub",
          mount: "NAVIGATION_CATALOG",
          target: "APP_PAGE",
          permissions: ["MANAGE_PRODUCTS"],
          url: "/hub",
        },
      ],
    };

    return manifest;
  },
});
