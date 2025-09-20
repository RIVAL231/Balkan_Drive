import { ApolloClient, InMemoryCache, from } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"

// @ts-expect-error - apollo-upload-client doesn't have TypeScript definitions
import UploadHttpLink from "../../node_modules/apollo-upload-client/UploadHttpLink.mjs"
import toast from "react-hot-toast"
import { config } from "./config"

/**
 * Apollo Upload Link for handling file uploads via GraphQL
 * 
 * Provides multipart form data support for file uploads through GraphQL mutations.
 * Uses the apollo-upload-client library to handle file uploads to the backend.
 */
const uploadLink = new UploadHttpLink({
  uri: config.apiUrl,
})

/**
 * Apollo authentication link for adding JWT tokens to requests
 * 
 * Features:
 * - Automatically adds Bearer token to authenticated requests
 * - Skips authentication for login/register operations
 * - Retrieves token from localStorage
 * - Handles missing token scenarios gracefully
 * 
 * @example
 * ```typescript
 * // Token is automatically added to headers for authenticated operations
 * const { data } = await apolloClient.query({
 *   query: MY_FILES_QUERY
 * })
 * ```
 */
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

/**
 * Apollo error link for handling GraphQL and network errors
 * 
 * Features:
 * - Automatic logout and redirect on authentication errors
 * - User-friendly error notifications via toast messages
 * - Network error handling with appropriate user feedback
 * - Silent handling for expected operation errors
 * - Centralized error management across the application
 * 
 * @example
 * ```typescript
 * // Errors are automatically handled globally
 * // Authentication errors trigger logout and redirect
 * // Other errors show toast notifications to user
 * ```
 */
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

/**
 * Apollo Client instance configured for the Balkan Drive application
 * 
 * Configuration:
 * - Upload support for file operations via apollo-upload-client
 * - JWT authentication with automatic token management
 * - Comprehensive error handling with user feedback
 * - Intelligent caching policies for different data types
 * - Type-safe cache policies for query optimization
 * 
 * Cache Policies:
 * - Files, shared files, public files: Always fetch fresh data
 * - Audit logs: Fresh data to ensure security compliance
 * - User statistics: Cached for performance
 * 
 * @example
 * ```typescript
 * import { apolloClient } from '@/lib/apollo'
 * 
 * // Use in components via hooks
 * const { data } = useQuery(MY_QUERY)
 * 
 * // Direct usage
 * const result = await apolloClient.query({
 *   query: MY_QUERY,
 *   variables: { id: '123' }
 * })
 * ```
 */
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache files queries for 5 minutes
          files: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
          sharedFiles: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
          publicFiles: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
          auditLogs: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
        },
      },
      File: {
        keyFields: ["id"],
      },
      User: {
        keyFields: ["id"],
      },
      AuditLog: {
        keyFields: ["id"],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-and-network", // Load from cache first, then network
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first", // Use cache when available
    },
    mutate: {
      errorPolicy: "all",
    },
  },
})
