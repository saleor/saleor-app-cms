import { SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk";
import {
  withRegisteredSaleorDomainHeader,
  withSaleorApp,
  withSaleorEventMatch,
  withWebhookSignatureVerified,
} from "@saleor/app-sdk/middleware";
import { Handler } from "retes";
import { toNextHandler } from "retes/adapter";
import { Response } from "retes/response";
import { GetProductDocument, UpdateProductMetadataDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { cmsClient } from "../../../api/cms";
import { createClient } from "../../../lib/graphql";

const CMS_ID_KEY = "cmsId";

type ProductCreated = unknown & { name: string; id: string };
type ProductCreatedParams = Record<string, ProductCreated>;

const handler: Handler<ProductCreatedParams> = async (request) => {
  const products = Object.values(request.params);
  const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await saleorApp.apl.get(saleorDomain);

  if (!authData) {
    return Response.Forbidden({
      error: `Could not find auth data for the domain ${saleorDomain}. Check if the app is installed.`,
    });
  }

  const client = createClient(`https://${saleorDomain}/graphql/`, async () =>
    Promise.resolve({ token: authData.token })
  );

  for (const product of products) {
    // todo: replace with real data
    const image = "";

    try {
      const getProductResponse = await client
        .query(GetProductDocument, {
          id: product.id,
        })
        .toPromise();

      const fullProduct = getProductResponse?.data?.product;

      if (fullProduct) {
        const updateProductResponse = await cmsClient.products.create({
          input: {
            id: product.id,
            name: product.name,
            slug: fullProduct?.slug,
            image,
          },
        });

        if (updateProductResponse.ok) {
          await client
            .mutation(UpdateProductMetadataDocument, {
              input: [{ key: CMS_ID_KEY, value: updateProductResponse.data.id }],
              id: product.id,
            })
            .toPromise();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  return Response.OK({ ok: true });
};

export default toNextHandler([
  withSaleorApp(saleorApp),
  withRegisteredSaleorDomainHeader,
  withSaleorEventMatch("product_created"),
  withWebhookSignatureVerified(),
  handler,
]);

export const config = {
  api: {
    bodyParser: false,
  },
};
