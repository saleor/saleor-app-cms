import { CMSSchema, CMS_ID_KEY } from "./config";
import { SettingsValue } from "@saleor/app-sdk/settings-manager";

const commonSettingsTypes = {
  array: ["enabledProviders"],
};

export type Setting = SettingsValue;

type MetadataItem = Record<string, any> & { key: string; value: string };

export const getCmsIdFromProduct = (product: Record<string, any> & { metadata: MetadataItem[] }) =>
  product.metadata.find((item) => item.key === CMS_ID_KEY)?.value;

const parseSettingsArray = (value: string) => {
  return value.replace("[", "").replace("]", "").split(",");
};

const parseSettingsValue = (key: string, value: string) => {
  if (commonSettingsTypes.array.includes(key)) {
    return parseSettingsArray(value);
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
};

// * MetadataManager that fuels the /api/settings endpoint can only store an array of { key: string; value: string }.
// * CMS Hub features a number of CMSes, each having its own config.

export type BaseConfig = Record<string, Record<string, string | boolean | string[]>>;

export const transformSettingsIntoConfig = (settings: Setting[]): BaseConfig => {
  return settings.reduce((prev, { key, value }) => {
    const [provider, setting] = key.split(".");
    return {
      ...prev,
      [provider]: {
        ...prev[provider],
        [setting]: parseSettingsValue(key, value),
      },
    };
  }, {} as Record<string, Record<string, string | boolean | string[]>>);
};

const parseOptionValue = ({
  name,
  value,
}: {
  name: string;
  value: string | boolean | string[];
}): string => {
  if (name.includes("enabled")) {
    return String(value === true);
  }

  return String(value);
};

export const transformConfigIntoSettings = <T extends keyof CMSSchema>(
  config: CMSSchema[T],
  provider: string,
  type: string
): Setting[] => {
  return Object.entries(config)
    .map(([name, value]) => {
      return {
        key: `${type}.${provider}.${name}`,
        value: parseOptionValue({ name, value }),
      };
    })
    .flatMap((c) => c);
};
