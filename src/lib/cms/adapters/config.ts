type BaseConfig = {
  enabled: boolean;
};

// todo: add tokens to configuration
type MakeConfig<TTokens extends string> = BaseConfig; /* & {
  tokens: Record<TTokens, string | null>;
}; */

type StrapiConfig = MakeConfig<"apiUrl" | "apiToken">;
type ContentfulConfig = MakeConfig<"environment" | "apiToken" | "spaceId" | "contentId">;

export type CMSProviderConfig = {
  strapi: StrapiConfig;
  contentful: ContentfulConfig;
};

export const defaultCmsProvidersFields: Record<CMSProvider, { label: string }> = {
  strapi: {
    label: "Strapi",
  },
  contentful: {
    label: "Contentful",
  },
};

export const defaultCmsProviderConfig: CMSProviderConfig = {
  strapi: {
    enabled: false,
    // tokens: {
    //   apiUrl: null,
    //   apiToken: null,
    // },
  },
  contentful: {
    enabled: false,
  },
};

export type CMSProvider = keyof CMSProviderConfig;
export const cmsProviders = Object.keys(defaultCmsProviderConfig) as CMSProvider[];
