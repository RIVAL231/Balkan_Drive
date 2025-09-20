import { useContext } from "react"
import { AuthContext } from "./useAuth"

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
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}