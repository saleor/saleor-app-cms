import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import type { NextApiRequest, NextApiResponse } from "next";

import { saleorApp } from "../../../saleor-app";
import { cmsProviders } from "../../api/cms/providers";
import { createSettingsManager } from "../../api/metadata";
import { createClient } from "../../lib/graphql";

type Setting = {
  key: string;
  value: string;
};

export type SettingsUpdateApiRequest = Setting[];

export interface SettingsApiResponse {
  success: boolean;
  data?: Setting[];
}

// todo: implement
// const obfuscateSecret = (secret: string) => {
//   return "*".repeat(secret.length - 4) + secret.substring(secret.length - 4);
// };

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

  const client = createClient(`https://${saleorDomain}/graphql/`, async () =>
    Promise.resolve({ token: authData.token })
  );

  const settings = createSettingsManager(client);

  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      data: await Promise.all(
        cmsProviders.map(async (provider) => ({
          key: provider,
          value: (await settings.get(provider)) ?? "",
        }))
      ),
    });
  } else if (req.method === "POST") {
    const newSettings = req.body as SettingsUpdateApiRequest;

    if (newSettings) {
      try {
        await settings.set(newSettings);
        console.log(newSettings);
        return res.status(200).json({ success: true });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false });
      }
    } else {
      console.log("Missing Settings Values");
      return res.status(400).json({ success: false });
    }
  }
  return res.status(405).end();
}
