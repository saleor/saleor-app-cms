export type ProductInput = { id: string; slug: string; image: string; name: string };

type ProductOperations = {
  getAll?: () => Promise<Response>;
  get?: ({ id }: { id: string }) => Promise<Response>;
  create: ({ input }: { input: ProductInput }) => Promise<Response>;
  update: ({ id, input }: { id: string; input: ProductInput }) => Promise<Response>;
  delete: ({ id }: { id: string }) => Promise<Response>;
};

export type CmsClient = {
  products: ProductOperations;
};
