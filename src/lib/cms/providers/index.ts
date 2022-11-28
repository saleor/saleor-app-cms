import { z } from "zod";
import contentful from "./contentful";
import strapi from "./strapi";

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
} as const;

const cmsProviders = {
  contentful,
  strapi,
};

export type CMSProvider = keyof typeof cmsProviders;

export default cmsProviders;

// todo: helper function so you dont have to merge manually
export const providersSchema = z.object({
  strapi: cmsProviders.strapi.schema,
  contentful: cmsProviders.contentful.schema,
});

export type ProvidersSchema = z.infer<typeof providersSchema>;
