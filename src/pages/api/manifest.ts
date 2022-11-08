import { AppManifest } from "@saleor/app-sdk";
import { createManifestHandler } from "@saleor/app-sdk/handlers/next";

import packageJson from "../../../package.json";

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
        /**
         * Configure webhooks here. They will be created in Saleor during installation
         * Read more
         * https://docs.saleor.io/docs/3.x/developer/api-reference/objects/webhook
         */
      ],
      extensions: [
        {
          label: "CMS Hub",
          mount: "NAVIGATION_CATALOG",
          target: "APP_PAGE",
          permissions: ["MANAGE_PRODUCTS"],
          url: "/pim",
        },
      ],
    };

    return manifest;
  },
});
