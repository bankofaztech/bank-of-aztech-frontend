import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets
} from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  walletConnectWallet,
  coreWallet,
  rainbowWallet,
  trustWallet
} from '@rainbow-me/rainbowkit/wallets'
import { WagmiProvider } from 'wagmi'
import { avalanche } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const wallets = [
  {
    groupName: 'Önerilen',
    wallets: [
      metaMaskWallet,
      walletConnectWallet,
      trustWallet,
      coreWallet,
      rainbowWallet
    ]
  }
]

const config = getDefaultConfig({
  appName: 'Bank of Aztech',
  projectId: '417117568ba3710a7108cb78adc524e8',
  chains: [avalanche],
  wallets,
  walletConnectParameters: {
    projectId: '417117568ba3710a7108cb78adc524e8',
    metadata: {
      name: 'Bank of Aztech',
      description: 'Bank of Aztech DeFi Platform',
      url: 'https://bankofaztech.github.io',
      icons: ['https://bankofaztech.github.io/logo.png']
    }
  }
})

const queryClient = new QueryClient()

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#805AD5',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
          modalSize="compact"
          showRecentTransactions={true}
        >
          <ChakraProvider theme={theme}>
            <App />
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
) 