export const cmsProviders = ["strapi"] as const;
export type CMSProvider = typeof cmsProviders[number];

export const cmsProvidersConfig: Record<CMSProvider, { label: string }> = {
  strapi: {
    label: "Strapi",
  },
};
