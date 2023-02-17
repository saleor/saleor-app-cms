import { z } from "zod";
import { providersConfig } from "./config";

export type ProductInput = Record<string, any> & {
  id: string;
  slug: string;
  name: string;
  image?: string;
};

export type CreateProductResponse =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string };

export type CmsOperations = {
  getAllProducts?: () => Promise<Response>;
  getProduct?: ({ id }: { id: string }) => Promise<Response>;
  createProduct: ({ input }: { input: ProductInput }) => Promise<CreateProductResponse>;
  updateProduct: ({ id, input }: { id: string; input: ProductInput }) => Promise<Response | void>;
  deleteProduct: ({ id }: { id: string }) => Promise<Response | void>;
};

export type GetProviderTokens<TProviderName extends keyof typeof providersConfig> =
  typeof providersConfig[TProviderName]["tokens"][number];

export type BaseConfig = { enabled: boolean };

// * Generates the config based on the data supplied in the `providersConfig` variable.
export type CreateProviderConfig<TProviderName extends keyof typeof providersConfig> = Record<
  GetProviderTokens<TProviderName>,
  string
> &
  BaseConfig;

export type CreateOperations<TConfig extends BaseConfig> = (config: TConfig) => CmsOperations;

export type Provider<TConfig extends BaseConfig> = {
  create: CreateOperations<TConfig>;
  schema: z.ZodType<TConfig>;
};
