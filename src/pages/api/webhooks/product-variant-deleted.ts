import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { ProductVariantDeletedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getCmsKeysFromSaleorItem } from "../../../lib/cms/client-utils/metadata";
import { createCmsClientsOperations } from "../../../lib/cms/client-utils/clients-operations";
import { executeCmsClientsOperations, executeMetadataUpdate } from "../../../lib/cms/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const ProductVariantDeletedWebhookPayload = gql`
  fragment ProductVariantDeletedWebhookPayload on ProductVariantDeleted {
    productVariant {
      id
      name
      sku
      product {
        id
        name
        slug
        media {
          url
        }
        channelListings {
          id
          channel {
            id
            slug
          }
          isPublished
        }
      }
      channelListings {
        id
        channel {
          id
          slug
        }
        price {
          amount
          currency
        }
      }
      metadata {
        key
        value
      }
    }
  }
`;

export const ProductVariantDeletedSubscription = gql`
  ${ProductVariantDeletedWebhookPayload}
  subscription ProductVariantDeleted {
    event {
      ...ProductVariantDeletedWebhookPayload
    }
  }
`;

export const productVariantDeletedWebhook =
  new SaleorAsyncWebhook<ProductVariantDeletedWebhookPayloadFragment>({
    name: "Cms-hub product variant deleted webhook",
    webhookPath: "api/webhooks/product-variant-deleted",
    asyncEvent: "PRODUCT_VARIANT_DELETED",
    apl: saleorApp.apl,
    subscriptionQueryAst: ProductVariantDeletedSubscription,
  });

export const handler: NextWebhookApiHandler<ProductVariantDeletedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { productVariant } = context.payload;

  console.log("PRODUCT_VARIANT_DELETED", productVariant);

  const productVariantCMSKeys = getCmsKeysFromSaleorItem(productVariant);
  const cmsClientsOperations = await createCmsClientsOperations({
    context,
    channelsToUpdate: [],
    cmsKeysToUpdate: productVariantCMSKeys,
  });

  if (productVariant) {
    const {
      cmsProviderInstanceProductVariantIds,
      cmsProviderInstanceProductVariantIdsToDelete,
      cmsErrors,
    } = await executeCmsClientsOperations({
      cmsClientsOperations,
      productVariant,
    });

    await executeMetadataUpdate({
      context,
      productVariant,
      cmsProviderInstanceProductVariantIds,
      cmsProviderInstanceProductVariantIdsToDelete,
    });

    if (!cmsErrors.length) {
      return res.status(200).end();
    } else {
      return res.status(500).json({ errors: cmsErrors });
    }
  }

  // const cmsClientInstances = await createCmsClientInstances(context, product?.channel);

  // console.log("PRODUCT_DELETED", product);
  // console.log("PRODUCT_DELETED triggered");

  // if (product) {
  //   cmsClientInstances.forEach(async (cmsClient) => {
  //     console.log("CMS client instance", cmsClient);

  //     const cmsId = getCmsIdFromSaleorItem(product, cmsClient.cmsProviderInstanceId);

  //     if (cmsId) {
  //       try {
  //         await cmsClient.operations.deleteProduct({
  //           id: cmsId,
  //         });
  //         return res.status(200).end();
  //       } catch (error) {
  //         console.log(error);
  //         return res.status(500).json({ error });
  //       }
  //     }
  //   });
  // }
};

export default productVariantDeletedWebhook.createHandler(handler);
