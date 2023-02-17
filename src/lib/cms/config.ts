import { z } from "zod";
import { CreateProviderConfig } from "./types";

export const CMS_ID_KEY = "cmsId";

// todo: add satisfies
export const providersConfig = {
  contentful: {
    name: "contentful",
    label: "Contentful",
    tokens: ["baseUrl", "token", "environment", "spaceId", "contentId", "locale"],
  },
  strapi: {
    name: "strapi",
    label: "Strapi",
    tokens: ["baseUrl", "token"],
  },
  datocms: {
    name: "datocms",
    label: "DatoCMS",
    tokens: ["baseUrl", "token", "environment", "itemTypeId"],
  },
} as const;

export type StrapiConfig = CreateProviderConfig<"strapi">;
export type ContentfulConfig = CreateProviderConfig<"contentful">;
export type DatocmsConfig = CreateProviderConfig<"datocms">;

export const strapiConfigSchema: z.ZodType<StrapiConfig> = z.object({
  token: z.string(),
  baseUrl: z.string(),
  enabled: z.boolean(),
});
export const contentfulConfigSchema: z.ZodType<ContentfulConfig> = z.object({
  token: z.string(),
  baseUrl: z.string(),
  environment: z.string(),
  spaceId: z.string(),
  locale: z.string(),
  contentId: z.string(),
  enabled: z.boolean(),
});
export const datocmsConfigSchema: z.ZodType<DatocmsConfig> = z.object({
  token: z.string(),
  baseUrl: z.string(),
  environment: z.string(),
  itemTypeId: z.string(),
  enabled: z.boolean(),
});

export const providersSchemaSet = {
  strapi: strapiConfigSchema,
  contentful: contentfulConfigSchema,
  datocms: datocmsConfigSchema,
};

export type CMSProviderSchema = keyof typeof providersSchemaSet;

// todo: helper function so you dont have to merge manually
export const providersSchema = z.object(providersSchemaSet);

export type ProvidersSchema = z.infer<typeof providersSchema>;