import React, { ReactNode } from "react";
import { ActiveSectionProvider } from "../context/sectionContex";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "./ThemeProvider";

export const GlobalProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ActiveSectionProvider>
        <NextTopLoader crawlSpeed={30} speed={50} showSpinner={false} />
        {children}
      </ActiveSectionProvider>
    </ThemeProvider>
  );
};
