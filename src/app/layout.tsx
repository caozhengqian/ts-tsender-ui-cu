import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import {ReactNode} from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TSender"
};

export default function RootLayout(props:{ children:ReactNode }) {
  return (
    <html
      lang="en"
    >
      <body>
        layout 
        <Providers>
          {props.children}
        </Providers>
        </body>
    </html>
  );
}
