import { z } from "zod";
import { ChannelFragment } from "../../../generated/graphql";
import { ContentfulIcon, DatocmsIcon, StrapiIcon } from "../../assets";
import { CreateProviderConfig } from "./types";

export const CMS_ID_KEY = "cmsId";

// todo: use types
// todo: add satisfies
export const providersConfig = {
  contentful: {
    name: "contentful",
    label: "Contentful",
    icon: ContentfulIcon,
    tokens: [
      { name: "baseUrl", label: "Base URL" },
      { name: "token", label: "Token" },
      { name: "environment", label: "Environment" },
      { name: "spaceId", label: "Space ID" },
      { name: "contentId", label: "Content ID" },
      { name: "locale", label: "Locale" },
    ],
  },
  strapi: {
    name: "strapi",
    label: "Strapi",
    icon: StrapiIcon,
    tokens: [
      { name: "baseUrl", label: "Base Url" },
      { name: "token", label: "Token" },
    ],
  },
  datocms: {
    name: "datocms",
    label: "DatoCMS",
    icon: DatocmsIcon,
    tokens: [
      {
        name: "token",
        label: "API Token (with access to Content Management API)",
        required: true,
      },
      {
        name: "itemTypeId",
        label: "Item Type ID (either number or text)",
        required: true,
      },
      {
        name: "baseUrl",
        label: "Base URL",
      },
      {
        name: "environment",
        label: "Environment",
      },
    ],
  },
} as const;

export type StrapiConfig = CreateProviderConfig<"strapi">;
export type ContentfulConfig = CreateProviderConfig<"contentful">;
export type DatocmsConfig = CreateProviderConfig<"datocms">;

export const channelsConfigSchema = z.object({
  enabledInChannels: z.array(z.string()),
});

export const strapiConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string(),
  baseUrl: z.string(),
  // enabled: z.boolean(), // @deprecated
  // enabledInChannels: z.array(z.string()),
});

export const contentfulConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string(),
  baseUrl: z.string(),
  environment: z.string(),
  spaceId: z.string(),
  locale: z.string(),
  contentId: z.string(),
  // enabled: z.boolean(), // @deprecated
  // enabledInChannels: z.array(z.string()),
});

export const datocmsConfigSchema = z.object({
  name: z.string().min(1),
  token: z.string().min(1),
  baseUrl: z.string(),
  environment: z.string(),
  itemTypeId: z.string().min(1),
  // enabled: z.boolean(), // @deprecated
  // enabledInChannels: z.array(z.string()),
});

export const providerCommonSchema = z.object({
  id: z.string(),
  providerName: z.string(),
});

export type ProviderCommonSchema = z.infer<typeof providerCommonSchema>;

export const channelCommonSchema = z.object({
  channelSlug: z.string(),
});

export type ChannelCommonSchema = z.infer<typeof channelCommonSchema>;

// todo: helper function so you dont have to merge manually
export const providersSchemaSet = {
  strapi: strapiConfigSchema.merge(providerCommonSchema),
  contentful: contentfulConfigSchema.merge(providerCommonSchema),
  datocms: datocmsConfigSchema.merge(providerCommonSchema),
};

export type CMSProviderSchema = keyof typeof providersSchemaSet;

export const providersSchema = z.object(providersSchemaSet);

export type ProvidersSchema = z.infer<typeof providersSchema>;

export type SingleProviderSchema = ProvidersSchema[keyof ProvidersSchema] & ProviderCommonSchema;

export const providerInstanceSchema = z.union([
  strapiConfigSchema.merge(providerCommonSchema),
  contentfulConfigSchema.merge(providerCommonSchema),
  datocmsConfigSchema.merge(providerCommonSchema),
]);

export type ProviderInstanceSchema = z.infer<typeof providerInstanceSchema>;

export const channelSchema = z
  .object({
    enabledProviderInstances: z.array(z.string()),
  })
  .merge(channelCommonSchema);

export type ChannelSchema = z.infer<typeof channelSchema>;

export type SingleChannelSchema = ChannelSchema & ChannelCommonSchema;

export type MergedChannelSchema = SingleChannelSchema & {
  channel: ChannelFragment;
};

export type CMSChannelSchema = keyof ChannelSchema;

export const cmsSchemaProviderInstances = z.record(z.string(), providerInstanceSchema);
export const cmsSchemaChannels = z.record(z.string(), channelSchema);
export const cmsSchema = z.object({
  providerInstances: cmsSchemaProviderInstances,
  channels: cmsSchemaChannels,
});

export type CMSSchemaProviderInstances = z.infer<typeof cmsSchemaProviderInstances>;
export type CMSSchemaChannels = z.infer<typeof cmsSchemaChannels>;
export type CMSSchema = z.infer<typeof cmsSchema>;
