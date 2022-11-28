import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { ProductDeletedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createCmsClient, getCmsIdFromProduct } from "../../../lib/cms";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const ProductDeletedWebhookPayload = gql`
  fragment ProductDeletedWebhookPayload on ProductDeleted {
    product {
      id
      metadata {
        key
        value
      }
    }
  }
`;

export const ProductDeletedSubscription = gql`
  ${ProductDeletedWebhookPayload}
  subscription ProductDeleted {
    event {
      ...ProductDeletedWebhookPayload
    }
  }
`;

export const productDeletedWebhook = new SaleorAsyncWebhook<ProductDeletedWebhookPayloadFragment>({
  name: "Cms-hub product deleted webhook",
  webhookPath: "api/webhooks/product-deleted",
  asyncEvent: "PRODUCT_DELETED",
  apl: saleorApp.apl,
  subscriptionQueryAst: ProductDeletedSubscription,
});

export const handler: NextWebhookApiHandler<ProductDeletedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { product } = context.payload;
  const cmsClient = await createCmsClient(context);
  console.log("PRODUCT_DELETED triggered");

  if (product && cmsClient) {
    const cmsId = getCmsIdFromProduct(product);

    if (cmsId) {
      try {
        await cmsClient.deleteProduct({
          id: cmsId,
        });
        return res.status(200).end();
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
      }
    }
  }
};

export default productDeletedWebhook.createHandler(handler);
