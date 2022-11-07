export type ProductInput = { id: string; slug: string; image: string; name: string };

type CreateCrudOperations<TInput extends Record<string, any>> = {
  getAll: () => Promise<Response>;
  get: ({ id }: { id: string }) => Promise<Response>;
  create: ({ input }: { input: TInput }) => Promise<Response>;
  update: ({ id, input }: { id: string; input: TInput }) => Promise<Response>;
  delete: ({ id }: { id: string }) => Promise<Response>;
};

export type ProductOperations = CreateCrudOperations<ProductInput>;

export type CmsClient = {
  products: ProductOperations;
};
