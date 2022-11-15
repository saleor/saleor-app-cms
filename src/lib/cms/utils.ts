import { CMS_ID_KEY } from "./const";

type MetadataItem = Record<string, any> & { key: string; value: string };

export const getCmsIdFromProduct = (product: Record<string, any> & { metadata: MetadataItem[] }) =>
  product.metadata.find((item) => item.key === CMS_ID_KEY)?.value;
