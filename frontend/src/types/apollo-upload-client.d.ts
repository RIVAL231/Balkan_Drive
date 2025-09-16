declare module "apollo-upload-client/UploadHttpLink.mjs" {
  import { ApolloLink } from "@apollo/client/core";

  export class UploadHttpLink extends ApolloLink {
    constructor(options: {
      uri?: string;
      fetch?: typeof fetch;
      headers?: Record<string, string>;
      credentials?: string;
    });
  }
}
