import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { ChannelFragment } from "../../generated/graphql";
import { cmsSchema, providersConfig } from "./cms/config";

const getFieldValue = (settingsManagerValue: string | undefined, fieldName: string) => {
  if (!settingsManagerValue && fieldName.includes("enabled")) {
    return "false";
  }

  return settingsManagerValue ?? "";
};

export const getSettings = async (settingsManager: EncryptedMetadataManager) => {
  // const defaultSettingNames = Object.keys(providersConfig).map((key) => `${key}.enabled`);
  // const settingsNames = Object.entries(providersConfig).reduce(
  //   (prev, [providerName, config]) => [
  //     ...prev,
  //     ...config.tokens.map((token) => `${providerName}.${token.name}`),
  //   ],
  //   [...defaultSettingNames] as string[]
  // );

  return await Promise.all(
    Object.keys(cmsSchema.shape).map(async (fieldName) => {
      const settingsManagerValue = await settingsManager.get(fieldName);
      return {
        key: fieldName,
        value: settingsManagerValue ? JSON.parse(settingsManagerValue) : [],
      };
    })
  );
};

// providersInstancesIds = ["first","second"]
// providersInstances.first.setting1 = "value1"
// providersInstances.first.setting2 = "value2"
// channels.channel1.enabledProviders = ["first","second"]
// channels.channel2.enabledProviders = ["first"]

/**
 * providersInstances = [
 *  {
 *   id: "first",
 *   ...
 *  },
 *  {
 *   id: "second",
 *   ...
 *  }
 * ],
 * channels = [
 *  {
 *   id: "channel1",
 *   enabledProviders: ["first","second"]
 *  },
 *  {
 *   id: "channel2",
 *   enabledProviders: ["first"]
 *  }
 * ]
 */
