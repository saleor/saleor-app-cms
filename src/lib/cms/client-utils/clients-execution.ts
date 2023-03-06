import { ProductVariantUpdatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { CmsClientOperations } from "../types";
import { getCmsIdFromSaleorItem } from "./metadata";

export const executeCmsClientsOperations = async ({
  cmsClientsOperations,
  productVariant,
}: {
  cmsClientsOperations: CmsClientOperations[];
  productVariant: Exclude<
    ProductVariantUpdatedWebhookPayloadFragment["productVariant"],
    undefined | null
  >;
}) => {
  const cmsProviderInstanceProductVariantIds: Record<string, string> = {};
  const cmsProviderInstanceProductVariantIdsToDelete: Record<string, string> = {};
  const cmsErrors: string[] = [];

  await Promise.all(
    cmsClientsOperations.map(async (cmsClient) => {
      console.log("CMS client instance", cmsClient);
      const cmsId = getCmsIdFromSaleorItem(productVariant, cmsClient.cmsProviderInstanceId);
      if (cmsId && cmsClient.operationType === "deleteProduct") {
        console.log("CMS deleting item", cmsId);
        try {
          await cmsClient.operations.deleteProduct({
            id: cmsId,
          });
          cmsProviderInstanceProductVariantIdsToDelete[cmsClient.cmsProviderInstanceId] = cmsId;
        } catch (error) {
          console.log(error);
          // return res.status(500).json({ error });
        }
      } else if (cmsId && cmsClient.operationType === "updateProduct") {
        console.log("CMS updating item", cmsId);
        try {
          await cmsClient.operations.updateProduct({
            // todo: change params of product methods because of below:
            // * In some CMSes, cmsId may be productId. Perhaps it's better to just pass everything as one big object
            // * and decide on the id on the provider level.
            id: cmsId,
            input: {
              saleorId: productVariant.id,
              slug: productVariant.product.slug,
              name: productVariant.name,
              image: productVariant.product.media?.[0]?.url ?? "",
              productName: productVariant.product.name,
              productSlug: productVariant.product.slug,
              price:
                productVariant.channelListings
                  ?.filter((cl) => cl.price)
                  .map((cl) => ({
                    channel: cl.channel.slug,
                    amount: cl.price?.amount,
                    currency: cl.price?.currency,
                  })) || [],
            },
          });
          // return res.status(200).end();
        } catch (error) {
          console.log(error);
          // return res.status(500).json({ error });
        }
      } else if (!cmsId && cmsClient.operationType === "createProduct") {
        console.log("CMS creating new item");
        try {
          const createProductResponse = await cmsClient.operations.createProduct({
            input: {
              saleorId: productVariant.id,
              slug: productVariant.product.slug,
              name: productVariant.name,
              image: productVariant.product.media?.[0]?.url ?? "",
              productName: productVariant.product.name,
              productSlug: productVariant.product.slug,
              price:
                productVariant.channelListings
                  ?.filter((cl) => cl.price)
                  .map((cl) => ({
                    channel: cl.channel.slug,
                    amount: cl.price?.amount,
                    currency: cl.price?.currency,
                  })) || [],
            },
          });

          console.log("createProductResponse", createProductResponse);

          if (createProductResponse?.ok) {
            cmsProviderInstanceProductVariantIds[cmsClient.cmsProviderInstanceId] =
              createProductResponse.data.id;
          } else {
            cmsErrors.push(createProductResponse?.error);
          }

          // return res.status(200).end();
        } catch (error) {
          console.log(error);
          // return res.status(500).json({ error });
        }
      }
    })
  );

  return {
    cmsProviderInstanceProductVariantIds,
    cmsProviderInstanceProductVariantIdsToDelete,
    cmsErrors,
  };
};
