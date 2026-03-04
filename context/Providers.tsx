"use client";
import { ThemeProvider } from "next-themes";
import React, { type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../app/api/uploadthing/core";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { SessionProvider } from "next-auth/react";
import { ReactQueryProvider } from "@/context/ReactQueryProvider";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <Toaster position="top-center" reverseOrder={false} />
      <SessionProvider>
        <ReactQueryProvider>
          <Provider store={store}>{children}</Provider>
        </ReactQueryProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
