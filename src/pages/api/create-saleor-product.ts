import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import type { NextApiHandler } from "next";
import { CreateProductDocument, ProductCreateInput } from "../../../generated/graphql";
import { apl } from "../../../saleor-app";

import { createClient } from "../../lib/graphql";

export type CreateSaleorProductBody = ProductCreateInput;

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(500).json({ error: "Only POST is supported!" });
  }

  const body = req.body as CreateSaleorProductBody;
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await apl.get(saleorDomain);

  if (!authData) {
    return res
      .status(403)
      .json({ error: `Could not find auth data for the domain ${saleorDomain}.` });
  }

  const client = createClient(`https://${saleorDomain}/graphql/`, async () => ({
    token: authData.token,
  }));

  try {
    const { data, error } = await client
      .mutation(CreateProductDocument, {
        input: body,
      })
      .toPromise();

    if (error) {
      return res.status(500).json({ error });
    }
    if (data?.productCreate?.errors) {
      return res.status(500).json({ error: data.productCreate.errors });
    }
    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    return res.status(500).json({ error: e });
  }
};

export default handler;
