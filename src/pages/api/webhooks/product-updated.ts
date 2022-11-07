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

type ProductUpdated = Record<string, any> & {
  name: string;
  id: string;
  metadata?: Record<string, any> & { cmsId?: string };
};
type ProductUpdatedParams = Record<string, ProductUpdated>;

const handler: Handler<ProductUpdatedParams> = async (request) => {
  const products = Object.values(request.params);

  for (const product of products) {
    const cmsId = product.metadata?.cmsId;

    if (cmsId) {
      try {
        await cmsClient.products.update({
          id: cmsId,
          input: {
            // * Currently, the only supported field is "name".
            name: product.name,
            // todo: replace with fetching the full product and using its product type
            productType: "1",
          },
          meta: {
            saleorId: product.id,
          },
        });
      } catch (error) {
        console.log(error);
      }
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
