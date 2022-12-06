# Contributing

## Overview

CMS Hub connects Saleor to a variety of CMSes. Each integration requires **a provider** that implements an interface for supported operations.

Currently, CMS Hub allows to perform operations on **products** (specifically, exporting them from Saleor to CMS). That means you need to implement creating, updating, and deleting a product through the API of the CMS you are integrating with.

CMS Hub will:

- execute the actions on the right webhook
- extract the product data and pass it to an provider
- provide some integration logic (e.g. add the product id from the CMS to the product metadata)
- create a UI and manage your integration's tokens based on supplied config

## Adding a provider

If you want to add a provider for a new CMS, here is what you have to do:

1. Go to `/src/lib/cms/providers/index.ts`.
2. Update the `providersConfig` variable with basic information about your provider: `name`, `label` and `tokens`:

```
export const providersConfig = {
  contentful: {
    ...
  },
  payload: {
    name: "payload",
    label: "Payload",
    tokens: ["baseUrl", "token"],
  },
} as const;
```

> `tokens` is an array that contains names of all the tokens your provider requires. The names will be used to:
>
> - generate config type (see: `CreateProviderConfig` in step 4)
> - generate an integration configuration view (see: `src/views/configuration.tsx`)
> - store & fetch the tokens from the settings API (see: `src/pages/api/settings.ts`)

3. Create a file following the naming convention `[cmsName].ts`, e.g.: `src/lib/cms/providers/payload.ts`. This file will contain all the provider logic. You can implement it as you like, as long as it follows the expected format.
4. Start with importing all the helper functions and types:

```
// src/lib/cms/providers/payload.ts
import { createProvider } from "./create";
import {
  CreateOperations,
  CreateProviderConfig,
} from "../types";
import { z } from "zod";

type PayloadConfig = CreateProviderConfig<"payload">; // Generates the type for a config based on the configuration in `src/lib/cms/providers/index.ts`.

const payloadConfigSchema: z.ZodType<PayloadConfig> = z.object({
  enabled: z.boolean(),
  ...
}); // Creates a schema for validating the config using [zod](https://github.com/colinhacks/zod).


const payloadOperations: CreateOperations<PayloadConfig> = (config) => {
  ...
} // This is where you write logic for all the supported operations (e.g. creating a product). This function runs only if the config was successfully validated.


export default createProvider(payloadOperations, payloadConfigSchema); // `createProvider` combines everything together.
```

5. Implement the operations:

```
...
const payloadOperations: CreateOperations<PayloadConfig> = (config) => {
  return {
    createProduct: async (payload) => ...,
  }
}
```

Each operation accepts a payload (sent from the webhook) and should return a promise. CMS Hub does not verify the value returned from the CMS.

> **Important!**
>
> The return type of the `createProduct` method is different than the rest. It must return **a promise** of:
>
> ```
> { ok: true; data: { id: string } } // the success state
> | { ok: false; error: string } // the failure state
> ```
>
> We need it to synchronise the Saleor product with the CMS product. The product id returned from the CMS is used to update the product metadata in Saleor.

6. Import your provider at the top of the `src/lib/cms/providers/index.ts` file:

```
import contentful from "./contentful";
...
import payload from "./payload";
```

7. Add it to the `cmsProviders` variable.

8. Add the `schema` to the `providersSchema` zod object:

```
export const providersSchema = z.object({
  strapi: cmsProviders.strapi.schema,
  ...
  payload: cmsProviders.payload.schema,
});
```

9. Go to `src/lib/cms/client.ts`. Add a `case` for your provider inside the `switch` statement in `createCmsClient` function:

```
switch (provider) {
  case "strapi": {
    return cmsProviders.strapi.create(config.strapi);
  }

  ...

  case "payload": {
    return cmsProviders.payload.create(config.payload);
  }

  ...
}
```

---

And that's it, you are golden! 🎖️
