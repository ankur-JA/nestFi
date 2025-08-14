"use client";

import { ApolloProvider as BaseApolloProvider } from "@apollo/client";
import { graphClient } from "~~/lib/graphql";

interface ApolloProviderProps {
  children: React.ReactNode;
}

export const ApolloProvider = ({ children }: ApolloProviderProps) => {
  if (!graphClient) {
    return <>{children}</>;
  }

  return <BaseApolloProvider client={graphClient}>{children}</BaseApolloProvider>;
};
