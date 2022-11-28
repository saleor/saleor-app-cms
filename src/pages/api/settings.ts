import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { SettingsValue } from "@saleor/app-sdk/settings-manager";
import type { NextApiRequest, NextApiResponse } from "next";

import { saleorApp } from "../../../saleor-app";
import { providersConfig } from "../../lib/cms";
import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";

export type Setting = SettingsValue;

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SettingsApiResponse>
) {
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await saleorApp.apl.get(saleorDomain);

  if (!authData) {
    console.debug(`Could not find auth data for the domain ${saleorDomain}.`);
    return res.status(401).json({ success: false });
  }

  const client = createClient(`https://${saleorDomain}/graphql/`, async () => ({
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
}
