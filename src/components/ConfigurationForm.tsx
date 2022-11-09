import { zodResolver } from "@hookform/resolvers/zod";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CMSProvider, cmsProvidersConfig } from "../api/cms/providers";
import { SettingsApiResponse, SettingsUpdateApiRequest } from "../pages/api/settings";

type FormValues = Record<CMSProvider, boolean>;

const schema: z.ZodType<FormValues> = z.object({
  strapi: z.boolean(),
});

export const ConfigurationForm = () => {
  const [isFetching, setIsFetching] = React.useState(false);
  const { appBridgeState } = useAppBridge();

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      strapi: false,
    },
  });

  const getSettings = async () => {
    setIsFetching(true);

    const response = await fetch("/api/settings", {
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
    });

    const result = (await response.json()) as SettingsApiResponse;
    setIsFetching(false);

    if (result.success) {
      const formValues = result.data?.reduce<FormValues>(
        (prev, next) => ({ ...prev, [next.key]: next.value === "true" }),
        {} as FormValues
      );

      reset(formValues);
    }
  };

  const saveSettings = async (settings: SettingsUpdateApiRequest) => {
    setIsFetching(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
      body: JSON.stringify(settings),
    });

    setIsFetching(false);
  };

  React.useEffect(() => {
    getSettings();
  }, []);

  const submitHandler = (values: FormValues) => {
    const settings: SettingsUpdateApiRequest = Object.entries(values).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    saveSettings(settings);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          marginBlockStart: "0",
          paddingInlineStart: "0",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {Object.entries(cmsProvidersConfig).map(([provider, config]) => (
          <li key={provider}>
            <label>
              <span>{config.label}</span>
              <input {...register(provider as CMSProvider)} type="checkbox" />
            </label>
            {/* {config.tokens.map((token) => (
              <div key={token}>
                <label>
                  {token}
                  <input type="text" name={token} />
                </label>
              </div>
            ))} */}
          </li>
        ))}
      </ul>
      <button disabled={isFetching} type="submit">
        {isFetching ? "..." : "Save"}
      </button>
    </form>
  );
};
