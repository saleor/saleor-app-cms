![Saleor App CMS Hub](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

<div align="center">
  <h1>Saleor App CMS Hub</h1>
</div>

# Overview

## What is it?

CMS Hub is a Saleor app that exports products from Saleor to several popular CMSes.

Currently supported CMSes are:

- [Strapi](https://strapi.io/)
- [Contentful](https://www.contentful.com/)

## How does it work?

1. `saleor-app-cms-hub` listens to Saleor product events through [webhooks](https://docs.saleor.io/docs/3.x/developer/extending/apps/asynchronous-webhooks).
2. When an event is triggered, we extract the product data and pass it to the CMS Client.
3. CMS Client checks what CMS you picked, transforms the data to the format the CMS expects, and sends it over.

## How to use it?

1. Install the application in your Dashboard.
2. Go to _Catalog -> CMS Hub_.
3. Choose the CMS. **Currently, we can only support one CMS at a time.**
4. Go to `.env.example` and provide the required tokens. They are different for each CMS.

## How can I contribute?

See [CONTRIBUTING.md](./CONTRIBUTING.md).
