import useProviderInstancesFetch from "./useProviderInstancesFetch";
import { SingleProviderSchema } from "../../../../lib/cms/config";
import { ProvidersErrors, ProvidersLoading } from "../types";

const useProviderInstances = () => {
  const {
    saveProviderInstance: saveProviderInstanceFetch,
    isSaving,
    data: settings,
    error: fetchingError,
    isFetching,
  } = useProviderInstancesFetch();

  const saveProviderInstance = (providerInstanceToSave: SingleProviderSchema) => {
    console.log("saveProviderInstance", providerInstanceToSave);

    saveProviderInstanceFetch(providerInstanceToSave);
  };

  const loading: ProvidersLoading = {
    fetching: isFetching,
    saving: isSaving,
  };

  const errors: ProvidersErrors = {
    fetching: fetchingError ? Error(fetchingError) : null,
    saving: null,
  };

  const providerInstances =
    (settings &&
      Object.entries(settings).map(([key, values]) => ({
        ...values,
      }))) ||
    [];

  return { providerInstances, saveProviderInstance, loading, errors };
};

export default useProviderInstances;
