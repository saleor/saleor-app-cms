import { v4 as uuidv4 } from "uuid";

import {
  NEXT_PUBLIC_CONTENTFUL_AUTH_TOKEN,
  NEXT_PUBLIC_CONTENTFUL_CONTENT_ID,
  NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT,
  NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
} from "../../../constants";
import { CmsClient, CreateProductResponse, ProductInput } from "../types";

const contentfulBaseUrl = "https://api.contentful.com";
const contentfulDefaultLocale = "en-US";
const contentfulToken = NEXT_PUBLIC_CONTENTFUL_AUTH_TOKEN;
const contentfulEnvironment = NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT;
const contentfulSpaceID = NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const contentfulContentID = NEXT_PUBLIC_CONTENTFUL_CONTENT_ID ?? "";

const contentfulFetch = (endpoint: string, options?: RequestInit) => {
  return fetch(`${contentfulBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${contentfulToken}`,
    },
  });
};

type ContentfulBody = {
  fields: Record<string, any>;
};

type ContentfulResponse = {
  message?: string;
  fields?: Record<string, any>;
  sys: {
    id: string;
    version?: number;
  };
};

const transformInputToBody = ({ input }: { input: ProductInput }): ContentfulBody => {
  const body = {
    fields: {
      id: {
        [contentfulDefaultLocale]: input.id,
      },
      slug: {
        [contentfulDefaultLocale]: input.slug,
      },
      name: {
        [contentfulDefaultLocale]: input.name,
      },
      // image: {
      //   [contentfulDefaultLocale]: input.image,
      // },
    },
  };
  return body;
};

const transformCreateProductResponse = (response: ContentfulResponse): CreateProductResponse => {
  if (response.message) {
    return {
      ok: false,
      error: "Something went wrong!",
    };
  }

  return {
    ok: true,
    data: {
      id: response.sys.id,
    },
  };
};

const getEntryEndpoint = (resourceID: string): string =>
  `/spaces/${contentfulSpaceID}/environments/${contentfulEnvironment}/entries/${resourceID}`;

export const contentfulClient: CmsClient = {
  products: {
    create: async (params) => {
      // Contentful API does not auto generate resource ID during creation, it has to be provided.
      const resourceID = uuidv4();
      const body = transformInputToBody(params);
      const endpoint = getEntryEndpoint(resourceID);
      const response = await contentfulFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
          "X-Contentful-Content-Type": contentfulContentID,
        },
      });
      const result = await response.json();
      return transformCreateProductResponse(result);
    },
    update: async ({ id, input }) => {
      const body = transformInputToBody({ input });
      const endpoint = getEntryEndpoint(id);
      const getEntryResponse = await contentfulFetch(endpoint, { method: "GET" });
      const entry = await getEntryResponse.json();
      const response = await contentfulFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
          "X-Contentful-Version": entry.sys.version,
        },
      });
      const result = await response.json();
      return result;
    },
    delete: ({ id }) => {
      const endpoint = getEntryEndpoint(id);
      return contentfulFetch(endpoint, { method: "DELETE" });
    },
  },
};
