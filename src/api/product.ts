import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { NextApiHandler } from "next";
import { Client } from "urql";
import {
  CreateProductDocument,
  DeleteProductDocument,
  DeleteProductMutationVariables,
  GetProductDocument,
  ProductCreateInput,
  UpdateProductDocument,
  UpdateProductMetadataDocument,
  UpdateProductMutationVariables,
} from "../../generated/graphql";
import { apl } from "../../saleor-app";
import { createClient } from "../lib/graphql";
import { getClientUrl } from "./saleor";

export type CreateSaleorProductBody = { input: ProductCreateInput; metadata: { cmsId: string } };
export type EditSaleorProductBody = UpdateProductMutationVariables;
export type DeleteSaleorProductBody = DeleteProductMutationVariables;
const CMS_ID_KEY = "cmsId";

// todo: generalize error handling and auth

const checkProductExistence = async (client: Client, id: string) => {
  // todo: check if there is a product with metadata that contains cms id
  // Problem: in order for the API to return a product, it must contain all the information (e.g. the channels etc.).
  // That extends the scope of the app.
  const { data, error } = await client
    .query(GetProductDocument, {
      id,
    })
    .toPromise();

  const metadata = data?.product?.metadata;
  console.log(metadata);
  const doesExist = true;
  if (doesExist) {
    throw new Error("This product has already been created!");
  }
};

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

  const { input, metadata } = body;

  try {
    // await checkProductExistence();
    const { data, error } = await client
      .mutation(CreateProductDocument, {
        input,
      })
      .toPromise();

    const id = data?.productCreate?.product?.id;

    if (error) {
      return res.status(500).json({ error });
    }

    if (id) {
      // * Update the product metadata with the cmsId.
      // * `cmsId` is the id of the product in the CMS we integrate with.
      await client
        .mutation(UpdateProductMetadataDocument, {
          input: [{ key: CMS_ID_KEY, value: metadata.cmsId }],
          id,
        })
        .toPromise();
    }

    return res.status(200).json({ ok: true, data: data?.productCreate?.product });
  } catch (e: unknown) {
    return res.status(500).json({ error: e });
  }
};

export const updateProductHandler: NextApiHandler = async (req, res) => {
  // todo
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
  // todo
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
