type BaseConfig = {
  enabled: boolean;
};

type MakeConfig<TTokens extends string> = BaseConfig; /* & {
  tokens: Record<TTokens, string | null>;
}; */

type StrapiConfig = MakeConfig<"apiUrl" | "apiToken">;

export type CMSProviderConfig = {
  strapi: StrapiConfig;
};

export const defaultCmsProvidersFields: Record<CMSProvider, { label: string }> = {
  strapi: {
    label: "Strapi",
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
};

export type CMSProvider = keyof CMSProviderConfig;
export const cmsProviders = Object.keys(defaultCmsProviderConfig) as CMSProvider[];
