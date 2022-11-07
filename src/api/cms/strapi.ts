import { NEXT_PUBLIC_STRAPI_API_URL, NEXT_PUBLIC_STRAPI_AUTH_TOKEN } from "../../constants";
import { CmsClient, ProductInput } from "./types";

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
      saleor_id: input.id,
    },
  };
  return body;
};

export const strapiClient: CmsClient = {
  products: {
    getAll: () => {
      return strapiFetch("/products");
    },
    get: ({ id }) => {
      return strapiFetch(`/products/${id}`);
    },
    create: (params) => {
      const body = transformInputToBody(params);
      return strapiFetch("/products", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    update: ({ id, input }) => {
      const body = transformInputToBody({ input });
      return strapiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
    },
    delete: ({ id }) => {
      return strapiFetch(`/products/${id}`, { method: "DELETE" });
    },
  },
};
