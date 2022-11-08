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
import { GetProductDocument } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { cmsClient } from "../../../api/cms";
import { createClient } from "../../../lib/graphql";

type ProductUpdated = Record<string, any> & {
  name: string;
  id: string;
  metadata?: unknown & { cmsId?: string };
};
type ProductUpdatedParams = Record<string, ProductUpdated>;

const handler: Handler<ProductUpdatedParams> = async (request) => {
  // * product_updated event triggers on product_created as well 🤷
  // todo: recognize duplicated events
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
    const cmsId = product.metadata?.cmsId;

    if (cmsId) {
      try {
        const getProductResponse = await client
          .query(GetProductDocument, {
            id: product.id,
          })
          .toPromise();

        const fullProduct = getProductResponse?.data?.product;

        if (fullProduct) {
          await cmsClient.products.update({
            id: cmsId,
            input: {
              slug: fullProduct.slug,
              id: product.id,
              name: product.name,
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      return Response.InternalServerError({
        error: "Unable to update the CMS product. cmsId was not found in the product metadata.",
      });
    }
  }

  return Response.OK({ ok: true });
};

export default toNextHandler([
  withSaleorApp(saleorApp),
  withRegisteredSaleorDomainHeader,
  withSaleorEventMatch("product_updated"),
  withWebhookSignatureVerified(),
  handler,
]);

export const config = {
  api: {
    bodyParser: false,
  },
};
