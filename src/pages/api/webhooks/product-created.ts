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

type ProductCreated = unknown & { name: string; id: string };
type ProductCreatedParams = Record<string, ProductCreated>;

const handler: Handler<ProductCreatedParams> = async (request) => {
  const products = Object.values(request.params);

  for (const product of products) {
    // todo: replace with real data
    const slug = "mocked";
    const image = "";
    try {
      const response = await cmsClient.products.create({
        input: {
          id: product.id,
          name: product.name,
          slug,
          image,
        },
      });

      // if (response.ok) {
      //   // todo: use response.id to update metadata
      //   await client
      //     .mutation(UpdateProductMetadataDocument, {
      //       input: [{ key: CMS_ID_KEY, value: metadata.cmsId }],
      //       id,
      //     })
      //     .toPromise();
      // }
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
