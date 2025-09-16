import { ApolloClient, InMemoryCache, from } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"

// @ts-expect-error - apollo-upload-client doesn't have TypeScript definitions
import UploadHttpLink from "../../node_modules/apollo-upload-client/UploadHttpLink.mjs"
import toast from "react-hot-toast"

const uploadLink = new UploadHttpLink({
  uri: "http://localhost:8080/query",
})

const authLink = setContext((operation, { headers }) => {
  // Skip adding auth header for login and register mutations
  const operationName = operation.operationName;
  if (operationName === 'Login' || operationName === 'Register') {
    return {
      headers: {
        ...headers,
      },
    }
  }
  
  const token = localStorage.getItem("auth_token")
  
  // Only add authorization header if we have a token
  if (token) {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }
  }
  
  // For requests without token, don't add authorization header
  return {
    headers: {
      ...headers,
    },
  }
})

const errorLink = onError((errorResponse: unknown) => {
  const { graphQLErrors, networkError, operation } = errorResponse as {
    graphQLErrors?: Array<{ message: string; extensions?: { code: string } }>;
    networkError?: { statusCode?: number };
    operation: { operationName?: string };
  };
  
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      if (error.extensions?.code === "UNAUTHENTICATED") {
        localStorage.removeItem("auth_token")
        window.location.href = "/login"
      } else {
        toast.error(error.message)
      }
    })
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle 401 errors specifically
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Only redirect to login if this isn't a login/register operation
      const operationName = operation.operationName;
      if (operationName !== 'Login' && operationName !== 'Register') {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        toast.error("Invalid credentials");
      }
    } else {
      toast.error("Network error occurred");
    }
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
})
