import "../styles/globals.css";

import { Theme } from "@material-ui/core/styles";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import { ThemeProvider as MacawUIThemeProvider } from "@saleor/macaw-ui";
import React, { PropsWithChildren, ReactElement, ReactNode, useEffect } from "react";
import { AppProps } from "next/app";
import GraphQLProvider from "../providers/GraphQLProvider";
import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { NoSSRWrapper } from "../lib/no-ssr-wrapper";
import { Provider as JotaiProvider } from "jotai";
import { NextPage } from "next";

const themeOverrides: Partial<Theme> = {
  /**
   * You can override MacawUI theme here
   */
};

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

/**
 * That's a hack required by Macaw-UI incompatibility with React@18
 */
const ThemeProvider = MacawUIThemeProvider as React.FC<
  PropsWithChildren<{ overrides?: Partial<Theme>; ssr: boolean }>
>;

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function NextApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  /**
   * Configure JSS (used by MacawUI) for SSR. If Macaw is not used, can be removed.
   */
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <NoSSRWrapper>
      <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
        <GraphQLProvider>
          <JotaiProvider>
            <ThemeProvider overrides={themeOverrides} ssr>
              <ThemeSynchronizer />
              <RoutePropagator />
              {getLayout(<Component {...pageProps} />)}
            </ThemeProvider>
          </JotaiProvider>
        </GraphQLProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default NextApp;
