import { AppManifest } from "@saleor/app-sdk/types";
import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

import packageJson from "../../../package.json";
import { productVariantUpdatedWebhook } from "./webhooks/product-variant-updated";
import { productUpdatedWebhook } from "./webhooks/product-updated";
import { productCreatedWebhook } from "./webhooks/product-created";
import { productDeletedWebhook } from "./webhooks/product-deleted";
import { productVariantCreatedWebhook } from "./webhooks/product-variant-created";
import { productVariantDeletedWebhook } from "./webhooks/product-variant-deleted";

export default createManifestHandler({
  async manifestFactory(context) {
    const manifest: AppManifest = {
      name: "CMS",
      tokenTargetUrl: `${context.appBaseUrl}/api/register`,
      appUrl: context.appBaseUrl,
      permissions: ["MANAGE_PRODUCTS"],
      id: "saleor.app.cms",
      version: packageJson.version,
      webhooks: [
        productUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
        productCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        productDeletedWebhook.getWebhookManifest(context.appBaseUrl),
        productVariantCreatedWebhook.getWebhookManifest(context.appBaseUrl),
        productVariantUpdatedWebhook.getWebhookManifest(context.appBaseUrl),
        productVariantDeletedWebhook.getWebhookManifest(context.appBaseUrl),
      ],
      extensions: [],
    };

    return manifest;
  },
});
