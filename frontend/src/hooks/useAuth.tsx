"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import {  gql } from "@apollo/client"
import { useMutation, useQuery } from "@apollo/client/react"
import { apolloClient } from "../lib/apollo"

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

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

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
      
      const { data } = await loginMutation({ variables: { email, password } })
      localStorage.setItem("auth_token", (data as { login: { token: string; user: User } }).login.token)
      setUser((data as { login: { token: string; user: User } }).login.user)
      
      // Clear Apollo cache and refetch queries to ensure fresh state
      await apolloClient.clearStore();
      
    } catch (error) {
      // Make sure to clear any tokens if login fails
      localStorage.removeItem("auth_token");
      throw error;
    }
  }

  const register = async (username: string, email: string, password: string, role: string) => {
    const { data } = await registerMutation({ variables: { username, email, password, role } })
    localStorage.setItem("auth_token", (data as { register: { token: string; user: User } }).register.token)
    setUser((data as { register: { token: string; user: User } }).register.user)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    window.location.href = "/login"
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
