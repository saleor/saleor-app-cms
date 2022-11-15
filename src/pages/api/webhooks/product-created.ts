import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductCreatedWebhookPayloadFragment,
  UpdateMetadataDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { CMS_ID_KEY, createCmsClient } from "../../../lib/cms";
import { createClient } from "../../../lib/graphql";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const ProductCreatedWebhookPayload = gql`
  fragment ProductCreatedWebhookPayload on ProductCreated {
    product {
      id
      name
      slug
      media {
        url
      }
    }
  }
`;

export const ProductCreatedSubscription = gql`
  ${ProductCreatedWebhookPayload}
  subscription ProductCreated {
    event {
      ...ProductCreatedWebhookPayload
    }
  }
`;

export const productCreatedWebhook = new SaleorAsyncWebhook<ProductCreatedWebhookPayloadFragment>({
  name: "Cms-hub product created webhook",
  webhookPath: "api/webhooks/product-created",
  asyncEvent: "PRODUCT_CREATED",
  apl: saleorApp.apl,
  subscriptionQueryAst: ProductCreatedSubscription,
});

export const handler: NextWebhookApiHandler<ProductCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { product } = context.payload;
  const { domain, token } = context.authData;

  const cmsClient = await createCmsClient(context);
  const apiClient = createClient(`https://${domain}/graphql/`, async () =>
    Promise.resolve({ token })
  );

  console.log("PRODUCT_CREATED triggered");

  if (product && cmsClient && apiClient) {
    try {
      const createProductResponse = await cmsClient?.products.create({
        input: {
          id: product.id,
          name: product.name,
          slug: product?.slug,
          image: product.media?.[0]?.url ?? "",
        },
      });

      if (createProductResponse?.ok) {
        await apiClient
          .mutation(UpdateMetadataDocument, {
            input: [{ key: CMS_ID_KEY, value: createProductResponse.data.id }],
            id: product.id,
          })
          .toPromise();
        return res.status(200).end();
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  }
};

export default productCreatedWebhook.createHandler(handler);
