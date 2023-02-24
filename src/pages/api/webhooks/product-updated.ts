import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { ProductUpdatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createCmsClient, getCmsIdFromProduct } from "../../../lib/cms";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const ProductUpdatedWebhookPayload = gql`
  fragment ProductUpdatedWebhookPayload on ProductUpdated {
    product {
      id
      name
      slug
      channel
      media {
        url
      }
      metadata {
        key
        value
      }
    }
  }
`;

export const ProductUpdatedSubscription = gql`
  ${ProductUpdatedWebhookPayload}
  subscription ProductUpdated {
    event {
      ...ProductUpdatedWebhookPayload
    }
  }
`;

export const productUpdatedWebhook = new SaleorAsyncWebhook<ProductUpdatedWebhookPayloadFragment>({
  name: "Cms-hub product updated webhook",
  webhookPath: "api/webhooks/product-updated",
  asyncEvent: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  subscriptionQueryAst: ProductUpdatedSubscription,
});

export const handler: NextWebhookApiHandler<ProductUpdatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  // * product_updated event triggers on product_created as well 🤷
  const { product } = context.payload;
  const cmsClient = await createCmsClient(context);
  console.log("PRODUCT_UPDATED triggered");

  if (product) {
    const cmsId = getCmsIdFromProduct(product);

    if (cmsId && cmsClient) {
      try {
        await cmsClient.updateProduct({
          // todo: change params of product methods because of below:
          // * In some CMSes, cmsId may be productId. Perhaps it's better to just pass everything as one big object
          // * and decide on the id on the provider level.
          id: cmsId,
          input: {
            slug: product.slug,
            id: product.id,
            name: product.name,
            image: product.media?.[0]?.url ?? "",
          },
        });
        return res.status(200).end();
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
      }
    }
  }
};

export default productUpdatedWebhook.createHandler(handler);
