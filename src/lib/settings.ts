import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { providersConfig } from "./cms/config";

const getFieldValue = (settingsManagerValue: string | undefined, fieldName: string) => {
  if (!settingsManagerValue && fieldName.includes("enabled")) {
    return "false";
  }

  return settingsManagerValue ?? "";
};

export const getSettings = async (settingsManager: EncryptedMetadataManager) => {
  const defaultSettingNames = Object.keys(providersConfig).map((key) => `${key}.enabled`);
  const settingsNames = Object.entries(providersConfig).reduce(
    (prev, [providerName, config]) => [
      ...prev,
      ...config.tokens.map((token) => `${providerName}.${token}`),
    ],
    [...defaultSettingNames] as string[]
  );

  return await Promise.all(
    settingsNames.map(async (fieldName) => {
      const settingsManagerValue = await settingsManager.get(fieldName);
      return {
        key: fieldName,
        value: getFieldValue(settingsManagerValue, fieldName),
      };
    })
  );
};
