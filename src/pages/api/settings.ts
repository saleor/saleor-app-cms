import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";

import type { NextApiRequest, NextApiResponse } from "next";

import { saleorApp } from "../../../saleor-app";
import { providersConfig } from "../../lib/cms/config";
import { Setting } from "../../lib/cms/utils";
import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";

export type SettingsUpdateApiRequest = Setting[];

export interface SettingsApiResponse {
  success: boolean;
  data?: Setting[];
}

// todo: implement
// const obfuscateSecret = (secret: string) => {
//   return "*".repeat(secret.length - 4) + secret.substring(secret.length - 4);
// };

const getFieldValue = (settingsManagerValue: string | undefined, fieldName: string) => {
  if (!settingsManagerValue && fieldName.includes("enabled")) {
    return "false";
  }

  return settingsManagerValue ?? "";
};

const handler: NextProtectedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<SettingsApiResponse>,
  context
) => {
  const { authData } = context;

  const client = createClient(authData.saleorApiUrl, async () => ({
    token: authData.token,
  }));

  const settingsManager = createSettingsManager(client);

  if (req.method === "GET") {
    const defaultSettingNames = Object.keys(providersConfig).map((key) => `${key}.enabled`);
    const settingsNames = Object.entries(providersConfig).reduce(
      (prev, [providerName, config]) => [
        ...prev,
        ...config.tokens.map((token) => `${providerName}.${token}`),
      ],
      [...defaultSettingNames] as string[]
    );

    return res.status(200).json({
      success: true,
      data: await Promise.all(
        settingsNames.map(async (fieldName) => {
          const settingsManagerValue = await settingsManager.get(fieldName);
          return {
            key: fieldName,
            value: getFieldValue(settingsManagerValue, fieldName),
          };
        })
      ),
    });
  } else if (req.method === "POST") {
    const settings = req.body as SettingsUpdateApiRequest;

    if (settings) {
      try {
        await settingsManager.set(settings);
        return res.status(200).json({ success: true });
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
