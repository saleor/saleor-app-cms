import { AppContainer } from "../modules/ui/app-container";
import { AppMainBar } from "../modules/ui/app-main-bar";
import { AppLayout } from "../modules/ui/app-layout";
import AppTabs from "../modules/ui/app-tabs";
import ProviderInstances from "../modules/provider-instances/ui/provider-instances";
import { NextPageWithLayout } from "./_app";
import { ReactElement } from "react";

const Page: NextPageWithLayout = () => <ProviderInstances />;

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <main>
      <AppMainBar />
      <AppContainer>
        <AppTabs activeTab="providers" />
      </AppContainer>
      <AppLayout>{page}</AppLayout>
    </main>
  );
};

export default Page;
