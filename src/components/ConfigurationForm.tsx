import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Path, useForm } from "react-hook-form";
import { cmsProviders, ProvidersSchema, CMSProvider, providersConfig } from "../lib/cms";

type ConfigurationFormProps<TProvider extends CMSProvider> = {
  defaultValues: ProvidersSchema[TProvider];
  onSubmit: (values: ProvidersSchema[TProvider], provider: TProvider) => any;
  provider: TProvider;
  isLoading: boolean;
};

export const ConfigurationForm = <TProvider extends CMSProvider>({
  defaultValues,
  onSubmit,
  provider,
  isLoading,
}: ConfigurationFormProps<TProvider>) => {
  const schema = cmsProviders[provider].schema;
  const { register, handleSubmit, reset } = useForm<ProvidersSchema[TProvider]>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const submitHandler = (values: ProvidersSchema[TProvider]) => {
    onSubmit(values, provider);
  };

  const fields = providersConfig[provider].tokens;

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <details>
        <summary>
          <span>{providersConfig[provider].label}</span>
        </summary>
        <label>
          On / off
          <input {...register("enabled" as Path<ProvidersSchema[TProvider]>)} type="checkbox" />
        </label>
        {fields.map((tokenName) => (
          <div key={tokenName}>
            <label>
              {tokenName}
              <input
                {...register(tokenName as Path<ProvidersSchema[TProvider]>)}
                type="password"
                name={tokenName}
              />
            </label>
          </div>
        ))}
        <button disabled={isLoading} type="submit">
          {isLoading ? "..." : "Save"}
        </button>
      </details>
    </form>
  );
};
