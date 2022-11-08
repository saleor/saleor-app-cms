export type ProductInput = Record<string, any> & { id: string; slug: string; name: string };

export type CreateProductResponse =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string };

type ProductOperations = {
  getAll?: () => Promise<Response>;
  get?: ({ id }: { id: string }) => Promise<Response>;
  create: ({ input }: { input: ProductInput }) => Promise<CreateProductResponse>;
  update: ({ id, input }: { id: string; input: ProductInput }) => Promise<Response>;
  delete: ({ id }: { id: string }) => Promise<Response>;
};

export type CmsClient = {
  products: ProductOperations;
};
