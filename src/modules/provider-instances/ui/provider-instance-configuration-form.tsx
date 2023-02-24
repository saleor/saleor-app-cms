import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox, FormControlLabel, Grid, TextField, Typography } from "@material-ui/core";
import { Button, makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { Controller, Path, useForm } from "react-hook-form";
import { z } from "zod";
import {
  providersConfig,
  CMSProviderSchema,
  providersSchemaSet,
  ProvidersSchema,
  SingleProviderSchema,
  ProviderInstanceSchema,
} from "../../../lib/cms/config";
import { Provider } from "../../providers/config";

const useStyles = makeStyles((theme) => ({
  footer: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

interface ProviderInstanceConfigurationFormProps<TProvider extends CMSProviderSchema> {
  provider: Provider;
  providerInstance?: SingleProviderSchema | null;
  onSubmit: (provider: SingleProviderSchema) => any;
  loading: boolean;
}

const ProviderInstanceConfigurationForm = <TProvider extends CMSProviderSchema>({
  provider,
  providerInstance,
  onSubmit,
  loading,
}: ProviderInstanceConfigurationFormProps<TProvider>) => {
  const styles = useStyles();

  const schema = providersSchemaSet[provider.name as TProvider];
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    resetField,
    control,
    formState,
    trigger,
    unregister,
    watch,
  } = useForm<ProvidersSchema[TProvider]>({
    resolver: zodResolver(schema),
  });

  console.log("form", providerInstance);

  React.useEffect(() => {
    resetField("providerName" as Path<ProvidersSchema[TProvider]>, {
      defaultValue: provider.name,
    });

    if (providerInstance && providerInstance.providerName === provider.name) {
      console.log(providerInstance);
      reset(providerInstance as ProvidersSchema[TProvider]);
    }
  }, [provider, providerInstance]);

  const submitHandler = (values: SingleProviderSchema) => {
    console.log(values);

    onSubmit(values);
  };

  const fields = providersConfig[provider.name as TProvider].tokens;

  const errors = formState.errors;

  console.log(errors);

  return (
    <form id={providerInstance?.name} onSubmit={handleSubmit(submitHandler)}>
      <Grid container spacing={1}>
        {!!Object.entries(errors).length && (
          <Typography variant="body1" color="error">
            Error validating form
          </Typography>
        )}
        <input
          type="hidden"
          {...register("providerName" as Path<ProvidersSchema[TProvider]>)}
          value={provider.name}
        />
        <Grid item xs={12}>
          <TextField
            {...register("name" as Path<ProvidersSchema[TProvider]>)}
            label="Instance name"
            type="text"
            name="name"
            InputLabelProps={{
              shrink: !!watch("name" as Path<ProvidersSchema[TProvider]>),
            }}
            fullWidth
            error={!!errors.name}
            helperText={<>{errors.name?.message}</>}
          />
        </Grid>
        {fields.map((token) => (
          <Grid xs={12} item key={token.name}>
            <TextField
              {...register(token.name as Path<ProvidersSchema[TProvider]>, {
                required: "required" in token && token.required,
              })}
              // required={"required" in token && token.required}
              label={token.label}
              type="password"
              name={token.name}
              InputLabelProps={{
                shrink: !!watch(token.name as Path<ProvidersSchema[TProvider]>),
              }}
              fullWidth
              error={!!errors[token.name]}
              helperText={<>{errors[token.name]?.message}</>}
            />
          </Grid>
        ))}
        <Grid item xs={12} className={styles.footer}>
          <Button variant="primary" disabled={loading} type="submit">
            {loading ? "..." : providerInstance ? "Save" : "Add"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default ProviderInstanceConfigurationForm;
