# saleor-app-pim

## What is `saleor-app-pim`?

`saleor-app-pim` is a Saleor app that enables two-way integration with a CMS as a PIM.

The currently supported CMSes are:

- [Strapi](https://strapi.io/)

## How does it work?
<!-- todo: mermaid chart -->

![image](https://user-images.githubusercontent.com/44495184/199695741-29797a19-066d-47cb-a439-1d87497e7559.png)

Here is how `saleor-app-pim` ensures two-way integration:

### Saleor -> CMS

1. `saleor-app-pim` listens to Saleor product events through Webhooks.
2. When an event is triggered, we extract the product data from it and pass it to the CMS Client.
3. CMS Client transforms the data to the desired format and sends it to the CMS.

### CMS -> Saleor

Since `saleor-app-pim` is just a Saleor app, it can only contain the logic for communication from Saleor to the CMS.

Enabling the integration the other way around requires your effort. You will have to either:

- install a plugin
- use a template (for a new app)
- or copy & paste the code we provide

All these options have in common that they will communicate with the `saleor-app-pim` API that takes care of synchronizing the products.

You can find instructions for each CMS here:

- [Strapi](./docs/strapi.md)

## Progress
See [here](./docs/todo.md).
