import { CMS_ID_KEY } from "./config";
import { type ProvidersSchema, CMSProviderSchema } from "./config";
import { SettingsValue } from "@saleor/app-sdk/settings-manager";

export type Setting = SettingsValue;

type MetadataItem = Record<string, any> & { key: string; value: string };

export const getCmsIdFromProduct = (product: Record<string, any> & { metadata: MetadataItem[] }) =>
  product.metadata.find((item) => item.key === CMS_ID_KEY)?.value;

const parseSettingsValue = (value: string) => {
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

export type BaseConfig = Record<string, Record<string, string | boolean>>;

export const transformSettingsIntoConfig = (settings: Setting[]): BaseConfig => {
  return settings.reduce((prev, { key, value }) => {
    const [provider, setting] = key.split(".");
    return {
      ...prev,
      [provider]: {
        ...prev[provider],
        [setting]: parseSettingsValue(value),
      },
    };
  }, {} as Record<string, Record<string, string | boolean>>);
};

const parseOptionValue = ({ name, value }: { name: string; value: string | boolean }): string => {
  if (name.includes("enabled")) {
    return String(value === true);
  }

  return String(value);
};

export const transformConfigIntoSettings = <TProvider extends CMSProviderSchema>(
  config: ProvidersSchema[TProvider],
  provider: TProvider
): Setting[] => {
  return Object.entries(config)
    .map(([name, value]) => {
      return {
        key: `${provider}.${name}`,
        value: parseOptionValue({ name, value }),
      };
    })
    .flatMap((c) => c);
};
