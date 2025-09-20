"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import {  gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { apolloClient } from "../lib/apollo"

/**
 * GraphQL query to fetch current user information
 */
const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role
    }
  }
`

/**
 * GraphQL mutation for user login
 */
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`

/**
 * GraphQL mutation for user registration
 */
const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $role: String!) {
    register(username: $username, email: $email, password: $password, role: $role) {
      token
      user {
        id
        username
        email
        role
      }
    }
  }
`

/**
 * User data interface
 */
interface User {
  /** Unique user identifier */
  id: string
  /** User's chosen username */
  username: string
  /** User's email address */
  email: string
  /** User's role (e.g., 'user', 'admin') */
  role: string
}

/**
 * Authentication context interface defining available auth methods
 */
interface AuthContextType {
  /** Currently authenticated user, null if not logged in */
  user: User | null
  /** Whether auth state is currently being determined */
  loading: boolean
  /** Login function that authenticates user with email/password */
  login: (email: string, password: string) => Promise<void>
  /** Register function that creates new user account */
  register: (username: string, email: string, password: string, role: string) => Promise<void>
  /** Change password function for authenticated users */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  /** Logout function that clears user session */
  logout: () => void
}

/**
 * React context for authentication state and methods
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

/**
 * AuthProvider component that manages authentication state for the entire app
 * 
 * Features:
 * - Automatic token validation on app load
 * - Persistent authentication across browser sessions
 * - GraphQL integration for auth operations
 * - Loading states during auth operations
 * - Automatic logout on token expiration
 * - Client-side token storage management
 * 
 * @example
 * ```tsx
 * // Wrap your app with AuthProvider
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes>...</Routes>
 *       </Router>
 *     </AuthProvider>
 *   )
 * }
 * ```
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [registerMutation] = useMutation(REGISTER_MUTATION)
  
  const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null
  const hasToken = Boolean(token)
  
  const { data, error, loading: queryLoading } = useQuery(ME_QUERY, {
    skip: !hasToken,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all"
  })
  
  // Handle the query results
  useEffect(() => {
    if (!hasToken) {
      // No token, so we're not authenticated
      setUser(null)
      setLoading(false)
    } else if (!queryLoading) {
      // Query finished (either with data or error)
      if (data && (data as { me: User }).me) {
        setUser((data as { me: User }).me)
      } else {
        setUser(null)
        // Remove invalid token
        localStorage.removeItem("auth_token")
      }
      setLoading(false)
    }
  }, [hasToken, queryLoading, data, error])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing token before login attempt
      localStorage.removeItem("auth_token");
      
      const { data } = await loginMutation({ 
        variables: { email, password },
        errorPolicy: 'none' // Will throw on any GraphQL errors
      })
      
      // Type the expected response structure
      interface LoginResponse {
        login: {
          token: string;
          user: User;
        };
      }
      
      const typedData = data as LoginResponse | null;
      
      // Check if data exists and has the expected structure
      if (!typedData || !typedData.login) {
        // Create a GraphQL-style error response
        const errorResponse = {
          errors: [{ message: "Invalid response from server", path: ["login"] }],
          data: null
        };
        throw new Error(JSON.stringify(errorResponse));
      }

      localStorage.setItem("auth_token", typedData.login.token)
      setUser(typedData.login.user)
      
      // Clear Apollo cache and refetch queries to ensure fresh state
      await apolloClient.clearStore();
      
    } catch (error: unknown) {
      // Make sure to clear any tokens if login fails
      localStorage.removeItem("auth_token");
      
      // Define interfaces for Apollo error structure
      interface GraphQLError {
        message: string;
        path?: string[];
      }
      
      interface ApolloError {
        graphQLErrors?: GraphQLError[];
        networkError?: Error | null;
        message?: string;
      }
      
      const err = error as ApolloError;
      
      // Handle Apollo GraphQL errors
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const errorResponse = {
          errors: err.graphQLErrors.map((gqlErr: GraphQLError) => ({
            message: gqlErr.message,
            path: gqlErr.path || ["login"]
          })),
          data: null
        };
        throw new Error(JSON.stringify(errorResponse));
      }
      
      // Handle network errors
      if (err.networkError) {
        const errorResponse = {
          errors: [{ message: "Network error occurred", path: ["login"] }],
          data: null
        };
        throw new Error(JSON.stringify(errorResponse));
      }
      
      // If it's already a structured error, throw as-is
      if (err.message && err.message.startsWith('{')) {
        throw error;
      }
      
      // Otherwise, wrap in GraphQL-style error structure
      const errorResponse = {
        errors: [{ message: err.message || "Login failed", path: ["login"] }],
        data: null
      };
      throw new Error(JSON.stringify(errorResponse));
    }
  }

  const register = async (username: string, email: string, password: string, role: string) => {
    try {
      const { data } = await registerMutation({ 
        variables: { username, email, password, role },
        errorPolicy: 'none'
      })
      
      // Type the expected response structure
      interface RegisterResponse {
        register: {
          token: string;
          user: User;
        };
      }
      
      const typedData = data as RegisterResponse | null;
      
      // Check if data exists and has the expected structure
      if (!typedData || !typedData.register) {
        const errorResponse = {
          errors: [{ message: "Invalid response from server", path: ["register"] }],
          data: null
        };
        throw new Error(JSON.stringify(errorResponse));
      }
      
      localStorage.setItem("auth_token", typedData.register.token)
      setUser(typedData.register.user)
    } catch (error: unknown) {
      // Make sure to clear any tokens if registration fails
      localStorage.removeItem("auth_token");
      
      // Define interfaces for Apollo error structure
      interface GraphQLError {
        message: string;
        path?: string[];
      }
      
      interface ApolloError {
        graphQLErrors?: GraphQLError[];
        networkError?: Error | null;
        message?: string;
      }
      
      const err = error as ApolloError;
      
      // Handle Apollo GraphQL errors
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const errorResponse = {
          errors: err.graphQLErrors.map((gqlErr: GraphQLError) => ({
            message: gqlErr.message,
            path: gqlErr.path || ["register"]
          })),
          data: null
        };
        throw new Error(JSON.stringify(errorResponse));
      }
      
      // Handle network errors
      if (err.networkError) {
        const errorResponse = {
          errors: [{ message: "Network error occurred", path: ["register"] }],
          data: null
        };
        throw new Error(JSON.stringify(errorResponse));
      }
      
      // If it's already a structured error, throw as-is
      if (err.message && err.message.startsWith('{')) {
        throw error;
      }
      
      // Otherwise, wrap in GraphQL-style error structure
      const errorResponse = {
        errors: [{ message: err.message || "Registration failed", path: ["register"] }],
        data: null
      };
      throw new Error(JSON.stringify(errorResponse));
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    window.location.href = "/login"
  }
  interface ChangePasswordResponse {
  changePassword: {
    success: boolean
    message: string
  }
}


const changePassword = async (currentPassword: string, newPassword: string) => {
  const CHANGE_PASSWORD_MUTATION = gql`
    mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
      changePassword(oldPassword: $currentPassword, newPassword: $newPassword) 
      
    }
  `;
  try {
    const { data } = await apolloClient.mutate<ChangePasswordResponse>({
      mutation: CHANGE_PASSWORD_MUTATION,
      variables: { currentPassword, newPassword },
      errorPolicy: 'none'
    });
    if (data?.changePassword?.success) {
      // Handle successful password change (e.g., show a success message)
      console.log(data.changePassword.message);
    } else {
      // Handle failed password change (e.g., show an error message)
      console.error(data?.changePassword?.message || "Failed to change password");
    }
  } catch (error) {
    console.error("Error changing password:", error);
  }
}



  return <AuthContext.Provider value={{ user, loading, login, register, logout, changePassword }}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access authentication context
 * 
 * Provides access to the current user, authentication state, and auth methods.
 * Must be used within an AuthProvider component tree.
 * 
 * @throws {Error} When used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { user, logout, loading } = useAuth()
 *   
 *   if (loading) return <LoadingSpinner />
 *   if (!user) return <LoginPage />
 *   
 *   return (
 *     <div>
 *       <h1>Welcome, {user.username}!</h1>
 *       <Button onClick={logout}>Logout</Button>
 *     </div>
 *   )
 * }
 * 
 * // In a login form
 * function LoginForm() {
 *   const { login } = useAuth()
 *   
 *   const handleSubmit = async (email: string, password: string) => {
 *     try {
 *       await login(email, password)
 *       // User is now logged in, redirect or update UI
 *     } catch (error) {
 *       // Handle login error
 *     }
 *   }
 * }
 * ```
 */

