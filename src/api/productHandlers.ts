import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { NextApiHandler } from "next";
import {
  CreateProductDocument,
  CreateProductMutationVariables,
  DeleteProductDocument,
  DeleteProductMutationVariables,
  UpdateProductDocument,
  UpdateProductMutationVariables,
} from "../../generated/graphql";
import { apl } from "../../saleor-app";
import { createClient } from "../lib/graphql";

export type CreateSaleorProductBody = CreateProductMutationVariables;
export type EditSaleorProductBody = UpdateProductMutationVariables;
export type DeleteSaleorProductBody = DeleteProductMutationVariables;

const getClientUrl = (domain: string) => `https://${domain}/graphql/`;

export const createProductHandler: NextApiHandler = async (req, res) => {
  const body = req.body as CreateSaleorProductBody;
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await apl.get(saleorDomain);

  if (!authData) {
    return res
      .status(403)
      .json({ error: `Could not find auth data for the domain ${saleorDomain}.` });
  }

  const client = createClient(getClientUrl(saleorDomain), async () => ({
    token: authData.token,
  }));

  const { input } = body;

  try {
    const { data, error } = await client
      .mutation(CreateProductDocument, {
        input,
      })
      .toPromise();

    console.log(data);

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({ ok: true, data: data?.productCreate?.product });
  } catch (e: unknown) {
    return res.status(500).json({ error: e });
  }
};

export const updateProductHandler: NextApiHandler = async (req, res) => {
  const body = req.body as EditSaleorProductBody;
  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await apl.get(saleorDomain);

  if (!authData) {
    return res
      .status(403)
      .json({ error: `Could not find auth data for the domain ${saleorDomain}.` });
  }

  const client = createClient(getClientUrl(saleorDomain), async () => ({
    token: authData.token,
  }));

  const { input, id } = body;

  try {
    const { data, error } = await client
      .mutation(UpdateProductDocument, {
        input,
        id,
      })
      .toPromise();

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    return res.status(500).json({ error: e });
  }
};

export const deleteProductHandler: NextApiHandler = async (req, res) => {
  const body = req.body as EditSaleorProductBody;
  const { id } = body;

  const saleorDomain = req.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await apl.get(saleorDomain);

  if (!authData) {
    return res
      .status(403)
      .json({ error: `Could not find auth data for the domain ${saleorDomain}.` });
  }

  const client = createClient(getClientUrl(saleorDomain), async () => ({
    token: authData.token,
  }));

  try {
    const { data, error } = await client
      .mutation(DeleteProductDocument, {
        id: id,
      })
      .toPromise();

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    return res.status(500).json({ error: e });
  }
};
