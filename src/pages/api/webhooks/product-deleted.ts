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
import { saleorApp } from "../../../../saleor-app";
import { createCmsClient } from "../../../api/cms";

type ProductDeleted = Record<string, any> & {
  metadata?: unknown & { cmsId?: string };
};
type ProductDeletedParams = Record<string, ProductDeleted>;

const handler: Handler<ProductDeletedParams> = async (request) => {
  const products = Object.values(request.params);
  const saleorDomain = request.headers[SALEOR_DOMAIN_HEADER] as string;
  const authData = await saleorApp.apl.get(saleorDomain);

  if (!authData) {
    return Response.Forbidden({
      error: `Could not find auth data for the domain ${saleorDomain}. Check if the app is installed.`,
    });
  }

  const token = authData.token;
  const cmsClient = await createCmsClient({ domain: saleorDomain, token, host: request.host });

  for (const product of products) {
    const cmsId = product.metadata?.cmsId;

    if (cmsId && cmsClient) {
      try {
        await cmsClient.products.delete({
          id: cmsId,
        });
      } catch (error) {
        console.log(error);
        return Response.InternalServerError({
          error: "Something went wrong",
        });
      }
    } else {
      return Response.InternalServerError({
        error: "Unable to delete the CMS product. cmsId was not found in the product metadata.",
      });
    }
  }

  return Response.OK({ ok: true });
};

export default toNextHandler([
  withSaleorApp(saleorApp),
  withRegisteredSaleorDomainHeader,
  withSaleorEventMatch("product_deleted"),
  withWebhookSignatureVerified(),
  handler,
]);

export const config = {
  api: {
    bodyParser: false,
  },
};
