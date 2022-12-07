import { CircularProgress, FormHelperText, Grid, Typography } from "@material-ui/core";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import React from "react";
import { ConfigurationForm } from "../components/ConfigurationForm";
import {
  CMSProvider,
  ProvidersSchema,
  providersSchema,
  transformConfigIntoSettings,
  transformSettingsIntoConfig,
} from "../lib/cms";
import { SettingsApiResponse } from "../pages/api/settings";

const useGetSettings = () => {
  const { appBridgeState } = useAppBridge();
  const [isLoading, setIsLoading] = React.useState(false);
  const [config, setConfig] = React.useState<ProvidersSchema | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const getSettings = async () => {
    setIsLoading(true);

    const response = await fetch("/api/settings", {
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
    });

    const result = (await response.json()) as SettingsApiResponse;
    setIsLoading(false);

    if (result.success && result.data) {
      const config = transformSettingsIntoConfig(result.data);
      const validation = providersSchema.safeParse(config);

      if (validation.success) {
        setConfig({ ...config, ...(validation.data as ProvidersSchema) });
      } else {
        // todo: show toast instead
        setValidationError(validation.error.message);
      }
    }
  };

  React.useEffect(() => {
    getSettings();
  }, []);

  return { data: config, isLoading, error: validationError };
};

export const Configuration = () => {
  const { appBridgeState } = useAppBridge();
  const { data: config, error, isLoading: isFetching } = useGetSettings();
  const [isSaving, setIsSaving] = React.useState(false);

  const saveSettings = async <TProvider extends CMSProvider>(
    config: ProvidersSchema[TProvider],
    provider: TProvider
  ) => {
    const settings = transformConfigIntoSettings(config, provider);

    try {
      setIsSaving(true);
      await fetch("/api/settings", {
        method: "POST",
        headers: [
          ["content-type", "application/json"],
          [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
          [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
        ],
        body: JSON.stringify(settings),
      });
      setIsSaving(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h1">Configuration</Typography>
        </Grid>
        <Grid item xs={12}>
          {isFetching && <CircularProgress />}
          {error && <FormHelperText error>{error}</FormHelperText>}
          <Grid container spacing={1}>
            {config &&
              Object.entries(config).map(([providerName, values]) => (
                <Grid item xs={12} key={providerName}>
                  <ConfigurationForm
                    provider={providerName as CMSProvider}
                    defaultValues={values}
                    onSubmit={saveSettings}
                    isLoading={isSaving}
                  />
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </section>
  );
};
