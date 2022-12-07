import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ClientContent = dynamic(() => import("../views"), {
  ssr: false,
});

/**
 * This is page publicly accessible from your app.
 * You should probably remove it.
 */
const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {appBridgeState?.ready && mounted ? (
        <ClientContent />
      ) : (
        <p>Install this app in your Dashboard and check extra powers!</p>
      )}
    </div>
  );
};

export default IndexPage;
