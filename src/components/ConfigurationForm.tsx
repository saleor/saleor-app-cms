import { zodResolver } from "@hookform/resolvers/zod";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CMSProvider, cmsProvidersConfig } from "../api/cms/providers";
import { SettingsUpdateApiRequest } from "../pages/api/settings";

type FormValues = Record<CMSProvider, boolean>;

const schema: z.ZodType<FormValues> = z.object({
  strapi: z.boolean(),
});

export const ConfigurationForm = () => {
  const { appBridgeState } = useAppBridge();

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const getSettings = () => {
    return fetch("/api/settings", {
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
    });
  };

  const addSettings = (settings: SettingsUpdateApiRequest) => {
    return fetch("/api/settings", {
      method: "POST",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
      body: JSON.stringify(settings),
    });
  };

  React.useEffect(() => {
    getSettings();
  }, []);

  const submitHandler = (values: FormValues) => {
    console.log(values);
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
            {config.tokens.map((token) => (
              <div key={token}>
                <label>
                  {token}
                  <input type="text" name={token} />
                </label>
              </div>
            ))}
          </li>
        ))}
      </ul>
      {/* {metadataResponse.fetching && <span>Updating...</span>}
      {metadataResponse.data?.updateMetadata && <span>Updated ✅</span>}
      {metadataResponse.error && <span>Something went wrong ❌</span>} */}
      <button type="submit">Save</button>
    </form>
  );
};
