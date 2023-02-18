import { z } from "zod";
import { CreateProviderConfig } from "./types";

export const CMS_ID_KEY = "cmsId";

// todo: use types
// todo: add satisfies
export const providersConfig = {
  contentful: {
    name: "contentful",
    label: "Contentful",
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
    tokens: [
      { name: "baseUrl", label: "Base Url" },
      { name: "token", label: "Token" },
    ],
  },
  datocms: {
    name: "datocms",
    label: "DatoCMS",
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
