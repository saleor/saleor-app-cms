# saleor-app-cms-hub

## What is `saleor-app-cms-hub`?

`saleor-app-cms-hub` is a Saleor app that exports products from Saleor to CMSes.

Currently supported CMSes are:

- [Strapi](https://strapi.io/)
- [Contentful](https://www.contentful.com/)

## How does it work?

1. `saleor-app-cms-hub` listens to Saleor product events through Webhooks.
2. When an event is triggered, we extract the product data from it and pass it to the CMS Client.
3. CMS Client transforms the data to the desired format and sends it to the CMS.
