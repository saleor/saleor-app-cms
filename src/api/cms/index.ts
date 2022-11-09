import { NEXT_PUBLIC_CMS_PROVIDER } from "../../constants";
import { CMSProvider } from "./providers";
import { strapiClient } from "./strapi";

const cmsProvider: CMSProvider | string | undefined = NEXT_PUBLIC_CMS_PROVIDER;

const createCmsClient = () => {
  switch (cmsProvider) {
    case "strapi": {
      return strapiClient;
    }

    default: {
      throw new Error("The value of NEXT_PUBLIC_CMS_PROVIDER was not recognized.");
    }
  }
};

export const cmsClient = createCmsClient();
