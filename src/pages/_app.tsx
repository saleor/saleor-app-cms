import "../styles/globals.css";

import { Theme } from "@material-ui/core/styles";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
import {
  dark,
  light,
  SaleorThemeColors,
  ThemeProvider as MacawUIThemeProvider,
} from "@saleor/macaw-ui";
import React, { PropsWithChildren, ReactElement, ReactNode, useEffect } from "react";
import { AppProps } from "next/app";
import GraphQLProvider from "../providers/GraphQLProvider";
import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import { NoSSRWrapper } from "../lib/no-ssr-wrapper";
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

type PalettesOverride = Record<"light" | "dark", SaleorThemeColors>;

/**
 * Temporary override of colors, to match new dashboard palette.
 * Long term this will be replaced with Macaw UI 2.x with up to date design tokens
 */
const palettes: PalettesOverride = {
  light: {
    ...light,
    background: {
      default: "#fff",
      paper: "#fff",
    },
  },
  dark: {
    ...dark,
    background: {
      default: "hsla(211, 42%, 14%, 1)",
      paper: "hsla(211, 42%, 14%, 1)",
    },
  },
};

/**
 * That's a hack required by Macaw-UI incompatibility with React@18
 */
const ThemeProvider = MacawUIThemeProvider as React.FC<
  PropsWithChildren<{ overrides?: Partial<Theme>; ssr: boolean; palettes: PalettesOverride }>
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
            <ThemeProvider palettes={palettes} overrides={themeOverrides} ssr>
              <ThemeSynchronizer />
              <RoutePropagator />
              {getLayout(<Component {...pageProps} />)}
            </ThemeProvider>
        </GraphQLProvider>
      </AppBridgeProvider>
    </NoSSRWrapper>
  );
}

export default NextApp;
