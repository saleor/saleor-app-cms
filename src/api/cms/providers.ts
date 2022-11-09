export const cmsProviders = ["strapi"] as const;
export type CMSProvider = typeof cmsProviders[number];

export const cmsProvidersConfig: Record<CMSProvider, { label: string; tokens: string[] }> = {
  strapi: {
    label: "Strapi",
    tokens: ["apiUrl", "apiToken"],
  },
};
