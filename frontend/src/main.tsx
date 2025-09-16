import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ApolloProvider } from "@apollo/client"
import { Toaster } from "react-hot-toast"
import App from "./App"
import { apolloClient } from "./lib/apollo"
import "./index.css"
import { AuthProvider } from "./hooks/useAuth"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>,
)
