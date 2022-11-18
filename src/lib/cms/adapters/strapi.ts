import { NEXT_PUBLIC_STRAPI_API_URL, NEXT_PUBLIC_STRAPI_AUTH_TOKEN } from "../../../constants";
import { createCmsAdapter } from "../client";
import { CreateProductResponse, ProductInput } from "../types";

const strapiBaseUrl = NEXT_PUBLIC_STRAPI_API_URL;
const strapiToken = NEXT_PUBLIC_STRAPI_AUTH_TOKEN;

const strapiFetch = (endpoint: string, options?: RequestInit) => {
  return fetch(`${strapiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${strapiToken}`,
    },
  });
};

type StrapiBody = {
  data: Record<string, any> & { saleor_id: string };
};

const transformInputToBody = ({ input }: { input: ProductInput }): StrapiBody => {
  const body = {
    data: {
      name: input.name,
      slug: input.slug,
      saleor_id: input.id,
    },
  };
  return body;
};

type StrapiResponse =
  | {
      data: null;
      error: {
        status: number;
        name: string;
        message: string;
        details?: {
          errors: unknown[];
        };
      };
    }
  | {
      data: {
        id: string;
        attributes: Record<string, any>;
        meta: Record<string, any>;
      };
      error: null;
    };

const transformCreateProductResponse = (response: StrapiResponse): CreateProductResponse => {
  if (response.error) {
    return {
      ok: false,
      error: "Something went wrong!",
    };
  }

  return {
    ok: true,
    data: {
      id: response.data.id,
    },
  };
};

export const strapiClient = createCmsAdapter({
  products: {
    getAll: () => {
      return strapiFetch("/products");
    },
    get: ({ id }) => {
      return strapiFetch(`/products/${id}`);
    },
    create: async (params) => {
      const body = transformInputToBody(params);
      const response = await strapiFetch("/products", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const result = await response.json();

      return transformCreateProductResponse(result);
    },
    update: ({ id, input }) => {
      const body = transformInputToBody({ input });
      return strapiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
    },
    delete: ({ id }) => {
      return strapiFetch(`/products/${id}`, { method: "DELETE" });
    },
  },
});
