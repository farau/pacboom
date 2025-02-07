'use client'

import { createAppKit } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet, arbitrum } from '@reown/appkit/networks'
import React from 'react'

// 1. Get projectId at https://cloud.reown.com
const projectId = '624cf7597d09f46e13b604ab1e096f6a'

// 2. Create a metadata object
const metadata = {
  name: 'Pac Boom',
  description: 'Play the game and earn PAC BOOM points to defeat the bosses!',
  url: 'https://mywebsite.com', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

// 3. Create the AppKit instance
createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: [mainnet, arbitrum],
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    socials: false,
    email: false,
  }
})

export function AppKit({ children }) {
  return (
    <>{children}</> //make sure you have configured the <appkit-button> inside
  )
}

export default AppKit