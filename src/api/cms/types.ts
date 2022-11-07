import { ProductCreateInput } from "../../../generated/graphql";

export type ProductInput = ProductCreateInput;
export type ProductMeta = { saleorId: string };

type CreateCrudOperations<TInput extends Record<string, any>, TMeta extends Record<string, any>> = {
  getAll: () => Promise<Response>;
  get: ({ id }: { id: string }) => Promise<Response>;
  create: ({ input }: { input: TInput; meta: TMeta }) => Promise<Response>;
  update: ({ id, input }: { id: string; input: TInput; meta: TMeta }) => Promise<Response>;
  delete: ({ id }: { id: string }) => Promise<Response>;
};

export type ProductOperations = CreateCrudOperations<ProductInput, ProductMeta>;

export type CmsClient = {
  products: ProductOperations;
};
