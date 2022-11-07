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
  // ? How to determine whether the product has already been created?

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
          // * It's advised that saleorId is a unique key.
          // * This way be it can be used to prevent duplications.
          // ! In the current scenario, it does not prevent duplications for Strapi.
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
