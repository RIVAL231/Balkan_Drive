// Environment configuration
const getApiUrl = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return "http://localhost:8080/query"
  }
  
  // In production, use relative path since nginx will proxy to backend
  return "/query"
}

export const config = {
  apiUrl: getApiUrl(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
}