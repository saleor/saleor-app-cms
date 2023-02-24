import AppTabs from "../modules/ui/app-tabs";
import Channels from "../modules/channels/ui/channels";
import { AppContainer } from "../modules/ui/app-container";
import { AppLayout } from "../modules/ui/app-layout";
import { AppMainBar } from "../modules/ui/app-main-bar";
import { NextPageWithLayout } from "./_app";
import { ReactElement } from "react";

const Page: NextPageWithLayout = () => <Channels />;

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <main>
      <AppMainBar />
      <AppContainer>
        <AppTabs activeTab="channels" />
      </AppContainer>
      <AppLayout>{page}</AppLayout>
    </main>
  );
};

export default Page;
