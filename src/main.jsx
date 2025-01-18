import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { avalanche } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const config = getDefaultConfig({
  appName: 'Bank of Aztech',
  projectId: '417117568ba3710a7108cb78adc524e8',
  chains: [avalanche],
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
        >
          <ChakraProvider theme={theme}>
            <App />
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
) 