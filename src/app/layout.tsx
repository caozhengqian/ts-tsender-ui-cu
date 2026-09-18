import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {ReactNode} from "react";
import { Providers } from "./providers";
import Hearder from "@/components/Header"

export const metadata: Metadata = {
  title: "TSender"
};

export default function RootLayout(props:{ children:ReactNode }) {
  return (
    <html
      lang="en"
    >
      <body>
        <Providers>
          <Hearder/>
          {props.children}
        </Providers>
        </body>
    </html>
  );
}
