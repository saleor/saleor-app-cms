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

type ProductCreated = Record<string, any> & { name: string; id: string };
type ProductCreatedParams = Record<string, ProductCreated>;

const handler: Handler<ProductCreatedParams> = async (request) => {
  const products = Object.values(request.params);

  // * saleor-app-pim does not prevent duplications. You must take care of it in the CMS.
  // * An example solution would be to use saleorId as unique key for the CMS product.
  for (const product of products) {
    try {
      const response = await cmsClient.products.create({
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

      console.log(response);
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
