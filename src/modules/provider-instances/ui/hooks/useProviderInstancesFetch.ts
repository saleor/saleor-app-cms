import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import React from "react";
import { CMSSchemaProviderInstances, SingleProviderSchema } from "../../../../lib/cms/config";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { ProviderInstancesApiResponse } from "../../../../pages/api/provider-instances";

const useProviderInstancesFetch = () => {
  const { appBridgeState } = useAppBridge();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [config, setConfig] = React.useState<CMSSchemaProviderInstances | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const getProviderInstances = async () => {
    setIsFetching(true);

    const response = await fetch("/api/provider-instances", {
      headers: [
        ["content-type", "application/json"],
        [SALEOR_API_URL_HEADER, appBridgeState?.saleorApiUrl!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
    }).catch((r) => {
      setIsFetching(false);
      console.error(r);

      return r;
    });

    try {
      const result = (await response.json()) as ProviderInstancesApiResponse;
      setIsFetching(false);

      console.log("getSettings result", result);

      if (result.success && result.data) {
        // const config = transformSettingsIntoConfig(result.data);
        const config = result.data;
        console.log("getSettings config", config);
        // const validation = cmsSchemaProviderInstances.safeParse(config);
        // console.log("getSettings validation", validation);

        // if (validation.success) {
        //   setConfig({ ...config, ...(validation.data as CMSSchemaProviderInstances) });
        // } else {
        //   // todo: show toast instead
        //   setValidationError(validation.error.message);
        // }

        setConfig(config);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveProviderInstance = async (config: SingleProviderSchema) => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/provider-instances", {
        method: "POST",
        headers: [
          ["content-type", "application/json"],
          [SALEOR_API_URL_HEADER, appBridgeState?.saleorApiUrl!],
          [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
        ],
        body: JSON.stringify(config),
      });

      const result = await response.json();
      setIsSaving(false);

      console.log("saveSettings result", result);

      if (result.success && result.data) {
        const config = result.data;
        console.log("saveSettings config", config);

        setConfig(config);
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getProviderInstances();
  }, []);

  return { saveProviderInstance, isSaving, data: config, isFetching, error: validationError };
};

export default useProviderInstancesFetch;
