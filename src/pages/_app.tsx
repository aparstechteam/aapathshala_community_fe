import { UserProvider } from "@/components/contexts/UserContext";
import { Toaster } from "@/components/ui/toaster";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import "@/styles/tiptap.css";
import "@/styles/mention.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <GoogleOAuthProvider
        clientId={
          "509761008746-1jlsgdtigr4tjv4kivoap2cjgtb58rcp.apps.googleusercontent.com" as string
        }
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <Toaster />
          <Component {...pageProps} />
        </ThemeProvider>
      </GoogleOAuthProvider>
    </UserProvider>
  );
}
