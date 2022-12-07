import { zodResolver } from "@hookform/resolvers/zod";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
} from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { Button } from "@saleor/macaw-ui";
import React from "react";
import { Controller, Path, useForm } from "react-hook-form";
import { CMSProvider, cmsProviders, providersConfig, ProvidersSchema } from "../lib/cms";

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
  const { register, handleSubmit, reset, control } = useForm<ProvidersSchema[TProvider]>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (defaultValues) {
      console.log(defaultValues);
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const submitHandler = (values: ProvidersSchema[TProvider]) => {
    onSubmit(values, provider);
  };

  const fields = providersConfig[provider].tokens;

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <span>{providersConfig[provider].label}</span>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Controller
                    name={"enabled" as Path<ProvidersSchema[TProvider]>}
                    control={control}
                    render={({ field: props }) => (
                      <Checkbox
                        {...props}
                        checked={props.value === "true" || props.value === true}
                        onChange={(e) => props.onChange(e.target.checked)}
                      />
                    )}
                  />
                }
                label={"On / off"}
              />
            </Grid>
            {fields.map((tokenName) => (
              <Grid xs={12} item key={tokenName}>
                <TextField
                  {...register(tokenName as Path<ProvidersSchema[TProvider]>)}
                  label={tokenName}
                  type="password"
                  name={tokenName}
                  fullWidth
                />
              </Grid>
            ))}
            <Grid item xs={2}>
              <Button variant="primary" fullWidth disabled={isLoading} type="submit">
                {isLoading ? "..." : "Save"}
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </form>
  );
};
