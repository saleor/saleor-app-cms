# Contributing

## Overview

CMS Hub connects Saleor to a variety of CMSes. Each integration requires **an adapter** that implements an interface for the supported operations.

Currently, CMS Hub only supports operations on **products** (exporting them from Saleor to CMS). That means you need to implement creating, updating, and deleting a product in the CMS you are integrating with.

CMS Hub will:

- execute the actions on the right webhook
- extract the product data and pass it to an adapter
- provide some integration logic (e.g. add the product id from the CMS to the product metadata)

## Development

If you want to submit a PR with another CMS, here is what you have to do:

1. Go to `/src/lib/cms/adapters`.
2. Create a file following the convention `[cmsName].ts`, e.g.: `payload.ts`.
3. In your created file, import the following:

```
import { createCmsAdapter } from "../client";
```

This function allows you to declare an adapter for your CMS. It will make sure you implement all the required methods.

Each method accepts a payload (sent from the webhook) and should return a promise. CMS Hub does not verify the returned value.

> **Important!**
>
> The return type of the `create` method is different than the rest. It must return **a promise** of:
>
> ```
> { ok: true; data: { id: string } } // the success state
> | { ok: false; error: string } // the failure state
> ```
>
> We need it to synchronise the Saleor product with the CMS product. The product id returned from the CMS is used to update the product metadata in Saleor.

4. In the method body, implement adapter-specific logic.

```
const payloadClient = createCmsAdapter({
  products: {
    create: async (params) => { ...
```

The CMS you are integrating with may require sending the data in a specific format. All the transformations (and other operations) should happen here.

5. Add the `export` statement to `/src/lib/cms/adapters/index.ts`:

```
export { payloadClient } from "./payload";
```

6. Import the adapter and add it to the `switch` statement in `/src/lib/cms/client.ts`:

```
  switch (provider) {
    case "payload": {
      return payloadClient;
    }
    ...
  }
```

7. Create a type for your adapter's config in `src/lib/cms/config.ts`. It should utilize the `MakeConfig` util that accepts an union of token names:

```
type PayloadConfig = MakeConfig<"token" | "anotherToken>
```

> **Important!**
>
> Managing the tokens from the UI doesn't work yet. However, if you add the type as described, the feature will work for your adapter, once we add it.

Then add your created type to the `CMSProviderConfig`, as well as update the `defaultCmsProviderConfig` variable.

> 🙏 This part will be improved in the near future, don't worry.

8. Go to `/src/components/ConfigurationForm.tsx` and update the `schema` with validation for your adapter (currently only supports the `enabled` field).

---

And that's it, you are golden! 🎖️
