import { AuthData } from "@saleor/app-sdk/APL";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import {
  DeleteMetadataDocument,
  ProductVariantUpdatedWebhookPayloadFragment,
  UpdateMetadataDocument,
} from "../../../../generated/graphql";
import { createClient } from "../../graphql";
import { createCmsKeyForSaleorItem } from "./metadata";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

export const executeMetadataUpdate = async ({
  context,
  productVariant,
  cmsProviderInstanceProductVariantIds,
  cmsProviderInstanceProductVariantIdsToDelete,
}: {
  context: WebhookContext;
  productVariant: Exclude<
    ProductVariantUpdatedWebhookPayloadFragment["productVariant"],
    undefined | null
  >;
  cmsProviderInstanceProductVariantIds: Record<string, string>;
  cmsProviderInstanceProductVariantIdsToDelete: Record<string, string>;
}) => {
  const { domain, token } = context.authData;
  const apiClient = createClient(`https://${domain}/graphql/`, async () => ({ token }));

  if (Object.keys(cmsProviderInstanceProductVariantIds).length) {
    await apiClient
      .mutation(UpdateMetadataDocument, {
        id: productVariant.id,
        input: Object.entries(cmsProviderInstanceProductVariantIds).map(
          ([cmsProviderInstanceId, cmsProductVariantId]) => ({
            key: createCmsKeyForSaleorItem(cmsProviderInstanceId),
            value: cmsProductVariantId,
          })
        ),
      })
      .toPromise();
  }
  if (Object.keys(cmsProviderInstanceProductVariantIdsToDelete).length) {
    await apiClient
      .mutation(DeleteMetadataDocument, {
        id: productVariant.id,
        keys: Object.entries(cmsProviderInstanceProductVariantIdsToDelete).map(
          ([cmsProviderInstanceId]) => createCmsKeyForSaleorItem(cmsProviderInstanceId)
        ),
      })
      .toPromise();
  }
};
