"use-client"
import { UserProvider } from "@/components/contexts/UserContext";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";


export default function App({ Component, pageProps }: AppProps) {

  return (
    <UserProvider>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Toaster />
          <Component {...pageProps} />
        </ThemeProvider>
      </GoogleOAuthProvider>
    </UserProvider>
  )
}
