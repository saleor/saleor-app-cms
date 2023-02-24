import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";

import type { NextApiRequest, NextApiResponse } from "next";

import { saleorApp } from "../../../saleor-app";
import { CMSSchemaProviderInstances, SingleProviderSchema } from "../../lib/cms/config";
import { Setting } from "../../lib/cms/utils";
import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";
import { getSettings } from "../../lib/settings";

export type SettingsUpdateApiRequest = SingleProviderSchema;

export interface ProviderInstancesApiResponse {
  success: boolean;
  data?: CMSSchemaProviderInstances;
}

// todo: implement
// const obfuscateSecret = (secret: string) => {
//   return "*".repeat(secret.length - 4) + secret.substring(secret.length - 4);
// };

const handler: NextProtectedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ProviderInstancesApiResponse>,
  context
) => {
  const { authData } = context;

  const client = createClient(authData.saleorApiUrl, async () => ({
    token: authData.token,
  }));

  const settingsManager = createSettingsManager(client);

  if (req.method === "GET") {
    const settingsManagerValue = await settingsManager.get("providerInstances");

    return res.status(200).json({
      success: true,
      data: settingsManagerValue && JSON.parse(settingsManagerValue),
    });
  } else if (req.method === "POST") {
    const providerInstanceSettings = req.body as SingleProviderSchema;

    if (providerInstanceSettings) {
      const currentSettings = await settingsManager.get("providerInstances");
      const currentSettingsParsed = currentSettings && JSON.parse(currentSettings);

      const settings = [
        {
          key: "providerInstances",
          value: JSON.stringify({
            ...currentSettingsParsed,
            [providerInstanceSettings.name]: providerInstanceSettings,
          }),
        },
      ];

      try {
        await settingsManager.set(settings);

        return res.status(200).json({
          success: true,
          data: {
            ...currentSettingsParsed,
            [providerInstanceSettings.name]: providerInstanceSettings,
          },
        });
      } catch (error) {
        return res.status(500).json({ success: false });
      }
    } else {
      console.log("Missing Settings Values");
      return res.status(400).json({ success: false });
    }
  }
  return res.status(405).end();
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
