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
import { cmsClient } from "../../../api/cms";

type ProductDeleted = Record<string, any> & {
  metadata?: unknown & { cmsId?: string };
};
type ProductDeletedParams = Record<string, ProductDeleted>;

const handler: Handler<ProductDeletedParams> = async (request) => {
  const products = Object.values(request.params);

  for (const product of products) {
    const cmsId = product.metadata?.cmsId;

    if (cmsId) {
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
