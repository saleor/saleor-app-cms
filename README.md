# saleor-app-cms-hub

## What is `saleor-app-cms-hub`?

`saleor-app-cms-hub` is a Saleor app that enables integration from Saleor to a CMS of your choosing.

The currently supported CMSes are:

- [Strapi](https://strapi.io/)

## How does it work?

1. `saleor-app-cms-hub` listens to Saleor product events through Webhooks.
2. When an event is triggered, we extract the product data from it and pass it to the CMS Client.
3. CMS Client transforms the data to the desired format and sends it to the CMS.

## Progress

See [here](./docs/todo.md).
