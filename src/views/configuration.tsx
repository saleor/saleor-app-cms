import { zodResolver } from "@hookform/resolvers/zod";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MetadataInput, useUpdateMetadataMutation } from "../../generated/graphql";
import { CMSProvider, cmsProviders } from "../api/cms";

type FormValues = Record<CMSProvider, boolean>;

const schema: z.ZodType<FormValues> = z.object({
  strapi: z.boolean(),
});

export const Configuration = () => {
  const { appBridgeState } = useAppBridge();
  const [metadataResponse, metadataMutation] = useUpdateMetadataMutation();
  const { register, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // todo: verify
  const appId = appBridgeState?.id;

  const submitHandler = (values: FormValues) => {
    if (appId) {
      const metadata: MetadataInput[] = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      metadataMutation({ id: appId, input: metadata });
    }
  };

  return (
    <section>
      <form onSubmit={handleSubmit(submitHandler)}>
        <ul>
          {cmsProviders.map((provider) => (
            <li key={provider}>
              <label>
                <span>{provider}</span>
                <input {...register(provider)} type="checkbox" />
              </label>
            </li>
          ))}
        </ul>
        {metadataResponse.fetching && <span>Updating...</span>}
        {metadataResponse.data?.updateMetadata && <span>Updated ✅</span>}
        {metadataResponse.error && <span>Something went wrong ❌</span>}
      </form>
    </section>
  );
};
