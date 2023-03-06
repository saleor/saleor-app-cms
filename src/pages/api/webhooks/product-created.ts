import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductCreatedWebhookPayloadFragment,
  UpdateMetadataDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { createCmsClientInstances, createCmsIdForSaleorItem } from "../../../lib/cms";
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
      channel
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

  console.log("PRODUCT_CREATED", product);

  try {
    const cmsClientInstances = await createCmsClientInstances(context, product?.channel);
    const apiClient = createClient(`https://${domain}/graphql/`, async () => ({ token }));

    console.log("PRODUCT_CREATED triggered");

    if (product && cmsClientInstances && apiClient) {
      const cmsProviderInstanceProductIds: Record<string, string> = {};
      const cmsErrors: string[] = [];

      cmsClientInstances.forEach(async (cmsClient) => {
        console.log("CMS client instance", cmsClient);

        const createProductResponse = await cmsClient.operations.createProduct({
          input: {
            id: product.id,
            name: product.name,
            slug: product?.slug,
            image: product.media?.[0]?.url ?? "",
            channel: product.channel,
          },
        });

        if (createProductResponse?.ok) {
          cmsProviderInstanceProductIds[cmsClient.cmsProviderInstanceId] =
            createProductResponse.data.id;
        } else {
          cmsErrors.push(createProductResponse?.error);
        }
      });

      if (Object.keys(cmsProviderInstanceProductIds).length) {
        await apiClient
          .mutation(UpdateMetadataDocument, {
            id: product.id,
            input: Object.entries(cmsProviderInstanceProductIds).map(
              ([cmsProviderInstanceId, cmsProductId]) => ({
                key: createCmsIdForSaleorItem(cmsProviderInstanceId),
                value: cmsProductId,
              })
            ),
          })
          .toPromise();
      }

      if (!cmsErrors.length) {
        return res.status(200).end();
      } else {
        return res.status(500).json({ errors: cmsErrors });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: [error] });
  }
};

export default productCreatedWebhook.createHandler(handler);
