import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
// import { ConvexProviderWithClerk } from "convex/react-clerk";
// import { useAuth } from "@clerk/clerk-react";
// import { ConvexReactClient } from "convex/react";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import Header from "@/components/Header";
import SyncUserWithConvex from "@/components/SyncUserWithConvex";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Book IT - Ticketing SaaS",
  description:
    "A ticketing SaaS built with Next.js 15, Convex, Clerk, and Stripe Connect",
};

// const convex = new ConvexReactClient(
//   process.env.NEXT_PUBLIC_CONVEX_URL as string
// );
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ClerkProvider>
            <Header />
            <SyncUserWithConvex />
            {/* <ConvexProviderWithClerk client={convex} useAuth={useAuth}> */}
            <div className="p-4">
              {children}
              <Toaster />
            </div>

            {/* </ConvexProviderWithClerk> */}
          </ClerkProvider>
        </ConvexClientProvider>
      </body>
      {/* https://ticketing-saas-convex-clerk.vercel.app/event/jh7614ahrb5wefzrsr9y89rk51750x2w */}
      {/* https://github.com/sonnysangha/ticket-marketplace-saas-nextjs15-convex-clerk-stripe-connect/tree/main */}
      {/* https://www.youtube.com/watch?v=KdYci4gA2os&t=17253s */}
      {/*  NOTE: to run the app, run commands: 1. npm run dev
      2. npx convex dev 3. stripe listen --forward-to
      localhost:3000/apiwebhooks/strip */}
    </html>
  );
}
