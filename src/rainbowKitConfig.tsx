"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, base, mainnet, optimism, anvil, zksync, sepolia } from "wagmi/chains"
export default getDefaultConfig({
    appName: "TSender",
    projectId:process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains:[anvil,zksync,mainnet],
    ssr:false
})