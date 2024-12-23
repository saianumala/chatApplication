import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RecoilProvider from "./recoilProvider";
import { Session_Provider } from "./sessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "chat app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Session_Provider>
        <RecoilProvider>
          <body className={inter.className}>{children}</body>
        </RecoilProvider>
      </Session_Provider>
    </html>
  );
}
