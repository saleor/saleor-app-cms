import ProviderInstancesList from "./provider-instances-list";
import { Instructions } from "../../ui/instructions";
import ProviderInstanceConfiguration from "./provider-instance-configuration";
import { providersConfig, ProvidersSchema, SingleProviderSchema } from "../../../lib/cms/config";
import { useEffect, useState } from "react";
import useProviderInstances from "./hooks/useProviderInstances";

const ProviderInstances = () => {
  const { providerInstances, saveProviderInstance, loading, errors } = useProviderInstances();

  const [activeProviderInstanceName, setActiveProviderInstanceName] = useState<string | null>(
    providerInstances.length ? providerInstances[0].name : null
  );
  const [addNewProviderInstance, setAddNewProviderInstance] = useState<boolean>(false);

  const handleSetActiveProviderInstance = (providerInstance: SingleProviderSchema | null) => {
    setActiveProviderInstanceName(providerInstance?.name || null);

    if (addNewProviderInstance) {
      setAddNewProviderInstance(false);
    }
  };
  const handleAddNewProviderInstance = () => {
    setAddNewProviderInstance(true);

    if (activeProviderInstanceName) {
      setActiveProviderInstanceName(null);
    }
  };

  const activeProviderInstance = providerInstances.find(
    (providerInstance) => providerInstance.name === activeProviderInstanceName
  );

  return (
    <>
      <ProviderInstancesList
        providerInstances={providerInstances}
        activeProviderInstance={activeProviderInstance}
        setActiveProviderInstance={handleSetActiveProviderInstance}
        requestAddProviderInstance={handleAddNewProviderInstance}
        loading={loading}
        errors={errors}
      />
      <ProviderInstanceConfiguration
        activeProviderInstance={activeProviderInstance}
        newProviderInstance={addNewProviderInstance}
        saveProviderInstance={saveProviderInstance}
        loading={loading}
        errors={errors}
      />
      <Instructions />
    </>
  );
};

export default ProviderInstances;
