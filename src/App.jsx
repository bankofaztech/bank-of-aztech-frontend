import React from 'react'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  Input, 
  useToast,
  Heading,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useColorModeValue,
  Flex,
  Spacer,
  HStack,
  Badge,
  SimpleGrid,
  Link,
  Icon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Fade,
  ModalHeader,
  ModalFooter,
  Divider
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { FaTelegram, FaChartLine, FaInfoCircle, FaCheckCircle, FaExchangeAlt, FaTwitter, FaExternalLinkAlt, FaCoins, FaGithub } from 'react-icons/fa'
import { GiOwl } from 'react-icons/gi'
import stakingAbi from './contracts/stakingAbi.json'
import tokenAbi from './contracts/tokenAbi.json'
import PerpLendingModal from './components/PerpLendingModal'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useConnect, useContractRead, useContractWrite, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseEther } from 'viem'
import perpsAbi from './contracts/perpsAbi.json'

const STAKING_CONTRACT_ADDRESS = "0x72C4ABEb42B175ab06c1BA4897530D49f0c5f77B"
const DEXSCREENER_PAIR = "0xc5a8db307d1db1f0abbf0aa6ef3fd757b3a87d7a"
const TOKEN_CONTRACT_ADDRESS = "0x7654B08cCd188643c9D6b639535a700D75EbC4FB"
const BOFA_TOKEN_ADDRESS = "0x7654B08cCd188643c9D6b639535a700D75EbC4FB"
const PERPS_CONTRACT_ADDRESS = "0xb87c8E0Ff569ecc17e0E7823111DddD0b41dc631"
const STAKING_DURATION = 3650 * 24 * 60 * 60 // 10 yıl (saniye cinsinden)

const formatNumber = (value, decimals = 2) => {
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Snowtrace API Key ve URL
const SNOWTRACE_API_KEY = 'QXKF2QVVYI3H5FZXKWKUQCBK9JEQXD3PVA'
const SNOWTRACE_API_URL = 'https://api.snowtrace.io/api'

function App() {
  const { address, isConnected } = useAccount()
  const [account, setAccount] = useState('')
  const [stakingContract, setStakingContract] = useState(null)
  const [tokenContract, setTokenContract] = useState(null)
  const [stakedAmount, setStakedAmount] = useState('0')
  const [earnedRewards, setEarnedRewards] = useState('0')
  const [stakeAmount, setStakeAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [stakePercentage, setStakePercentage] = useState(100)
  const [withdrawPercentage, setWithdrawPercentage] = useState(100)
  const [tokenPrice, setTokenPrice] = useState(0)
  const [tvl, setTvl] = useState('0')
  const [stakedUsdValue, setStakedUsdValue] = useState('0')
  const [earnedUsdValue, setEarnedUsdValue] = useState('0')
  const [isSwapOpen, setIsSwapOpen] = useState(false)
  const [totalRewards, setTotalRewards] = useState('0')
  const [remainingRewards, setRemainingRewards] = useState('0')
  const [stakingStartTime, setStakingStartTime] = useState(0)
  const [isInvestmentOpen, setIsInvestmentOpen] = useState(false)
  const [pools, setPools] = useState([])
  const [liquidityPools, setLiquidityPools] = useState([])
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [isPerpLendingOpen, setIsPerpLendingOpen] = useState(false)
  const [rewardAmount, setRewardAmount] = useState('')
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [holderCount, setHolderCount] = useState('0')
  const [transactionCount, setTransactionCount] = useState('0')
  const [isMinting, setIsMinting] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)
  const [lastTransactionHash, setLastTransactionHash] = useState(null);
  const [isApproveLoading, setIsApproveLoading] = useState(false);

  // Custom theme colors
  const bgColor = useColorModeValue('gray.800', 'gray.900')
  const borderColor = useColorModeValue('purple.500', 'purple.500')
  const statBgColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.100')
  const textColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.900')

  // Contract etkileşimleri için hooks
  const { data: currentCycleInfo } = useContractRead({
    address: PERPS_CONTRACT_ADDRESS,
    abi: perpsAbi,
    functionName: 'getCurrentCycleInfo',
    watch: true,
  })

  // Log currentCycleInfo
  useEffect(() => {
    console.log('Current Cycle Info:', currentCycleInfo)
  }, [currentCycleInfo])

  const { data: userStakedAmount } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'userStakedAmount',
    args: [address],
    watch: true,
  })

  const { data: earnedAmount } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'earned',
    args: [address],
    watch: true,
  })

  const { data: totalStakedAmount } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'totalStaked',
    watch: true,
  })

  const { writeContract: mintWrite, isLoading: isMintLoading } = useContractWrite({
    address: PERPS_CONTRACT_ADDRESS,
    abi: perpsAbi,
    functionName: 'mint',
  })

  const { writeContract: stakeWrite, isLoading: isStakeLoading } = useContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'stake',
  })

  const { writeContract: withdrawWrite, isLoading: isWithdrawLoading } = useContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'withdraw',
  })

  const { writeContract: collectWrite, isLoading: isCollectLoading } = useContractWrite({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'getReward',
  })

  const { data: tokenBalance } = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: tokenAbi,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
  })

  const { writeContract: approveWrite, isLoading: isApproving } = useContractWrite({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: tokenAbi,
    functionName: 'approve',
  })

  const { data: allowance } = useContractRead({
    address: TOKEN_CONTRACT_ADDRESS,
    abi: tokenAbi,
    functionName: 'allowance',
    args: [address, STAKING_CONTRACT_ADDRESS],
    watch: true,
  })

  const { data: totalStakingRewards } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'TOTAL_REWARDS',
    watch: true,
  })

  const { data: rewardRate } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'REWARD_RATE',
    watch: true,
  })

  const { data: rewardPerToken } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'rewardPerToken',
    watch: true,
  })

  const { data: totalClaimed } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'totalClaimed',
    watch: true,
  })

  // Transaction hooks
  const publicClient = usePublicClient()

  const waitForTransaction = async (hash) => {
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    return receipt
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any")
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setAccount(accounts[0])

        // Kontratları ayarla
        const signer = provider.getSigner()
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingAbi, signer)
        const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, tokenAbi, signer)
        
        setStakingContract(stakingContract)
        setTokenContract(tokenContract)

        // Hesap değişikliğini dinle
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            // Cüzdan bağlantısı kesildi
            setAccount('')
            setStakingContract(null)
            setTokenContract(null)
          } else {
            setAccount(accounts[0])
          }
        })

        // Ağ değişikliğini dinle
        window.ethereum.on('chainChanged', (chainId) => {
          window.location.reload()
        })

      }
    } catch (error) {
      console.error('Connect wallet error:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
      })
    }
  }

  const fetchTokenPrice = async () => {
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/avalanche/${DEXSCREENER_PAIR}`)
      const data = await response.json()
      const price = parseFloat(data.pair.priceUsd)
      setTokenPrice(price)
    } catch (error) {
      console.error('Price fetch error:', error)
    }
  }

  const fetchTVL = async () => {
    try {
      // Read-only provider for Avalanche
      const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc')
      const stakingContractReadOnly = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        stakingAbi,
        provider
      )
      
      const totalStaked = await stakingContractReadOnly.totalStaked()
      const totalStakedEth = ethers.utils.formatEther(totalStaked)
      setTvl(totalStakedEth)
    } catch (error) {
      console.error('TVL fetch error:', error)
    }
  }

  const fetchRewardsInfo = async () => {
    try {
      // Event'lerden gelen veriler kullanılacak
      if (stakingStartTime > 0) {
        const elapsedTime = Math.floor(Date.now() / 1000) - stakingStartTime
        const remainingTime = Math.max(0, STAKING_DURATION - elapsedTime)
        const dailyReward = ethers.utils.parseEther(totalRewards) / STAKING_DURATION
        const remainingRewardsAmount = dailyReward * remainingTime
        setRemainingRewards(ethers.utils.formatEther(remainingRewardsAmount))
      }
    } catch (error) {
      console.error('Rewards info fetch error:', error)
    }
  }

  const fetchLiquidityPools = async () => {
    try {
      // Tüm BOFA havuzlarını al
      const dexscreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${BOFA_TOKEN_ADDRESS}`)
      const dexscreenerData = await dexscreenerResponse.json()
      
      const allPools = dexscreenerData.pairs?.map(pair => ({
        name: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
        pair: pair.pairAddress,
        liquidity: pair.liquidity?.usd || 0,
        volume24h: pair.volume?.h24 || 0,
        price: pair.priceUsd || 0,
        dex: pair.dexId,
        type: pair.pairAddress.toLowerCase() === DEXSCREENER_PAIR.toLowerCase() ? 'main' : 'other'
      })) || []

      // Likiditeye göre sırala
      const sortedPools = allPools.sort((a, b) => b.liquidity - a.liquidity)
      setLiquidityPools(sortedPools)
      
      // Ana havuzun fiyatını güncelle
      const mainPool = sortedPools.find(pool => pool.type === 'main')
      if (mainPool) {
        setTokenPrice(parseFloat(mainPool.price))
      }
    } catch (error) {
      console.error('Liquidity pools fetch error:', error)
    }
  }

  useEffect(() => {
    fetchTokenPrice()
    fetchTVL()
    fetchRewardsInfo()
    fetchLiquidityPools()
    
    const priceInterval = setInterval(fetchTokenPrice, 30000)
    const tvlInterval = setInterval(fetchTVL, 60000)
    const rewardsInterval = setInterval(fetchRewardsInfo, 60000)
    const poolsInterval = setInterval(fetchLiquidityPools, 60000)
    
    return () => {
      clearInterval(priceInterval)
      clearInterval(tvlInterval)
      clearInterval(rewardsInterval)
      clearInterval(poolsInterval)
    }
  }, [])

  const updateBalances = async () => {
    if (stakingContract && account) {
      try {
        const staked = await stakingContract.userStakedAmount(account)
        setStakedAmount(ethers.utils.formatEther(staked))
        
        const earned = await stakingContract.earned(account)
        setEarnedRewards(ethers.utils.formatEther(earned))
      } catch (error) {
        console.error('Bakiye güncelleme hatası:', error)
      }
    }
  }

  const handleMint = async () => {
    try {
      if (!isConnected) {
        toast({
          title: 'Hata',
          description: 'Lütfen önce cüzdanınızı bağlayın.',
          status: 'error',
          duration: 5000,
        })
        return
      }

      setIsMinting(true)
      
      const config = {
        address: PERPS_CONTRACT_ADDRESS,
        abi: perpsAbi,
        functionName: 'mint',
      }
      
      const result = await mintWrite(config)
      
      toast({
        title: 'İşlem gönderildi',
        description: 'Mint işlemi başlatıldı, lütfen bekleyin...',
        status: 'info',
        duration: 5000,
        isClosable: true,
      })

      if (result?.hash) {
        const receipt = await waitForTransaction({ hash: result.hash })
        
        if (receipt.status === 'success') {
          toast({
            title: 'Başarılı',
            description: 'Mint işlemi başarıyla tamamlandı.',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
          
          // Bakiyeleri güncelle
          updateBalances()
        }
      }
    } catch (error) {
      // Sadece gerçek hataları göster
      if (error.message !== "Cannot read properties of undefined (reading 'hash')") {
        console.error('Mint error:', error)
        toast({
          title: 'Hata',
          description: error.message || 'Mint işlemi başarısız oldu.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } finally {
      setIsMinting(false)
    }
  }

  const handleApprove = async () => {
    try {
      if (!isConnected) {
        toast({
          title: 'Hata',
          description: 'Lütfen önce cüzdanınızı bağlayın.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      setIsApproveLoading(true);
      
      const approveConfig = {
        address: TOKEN_CONTRACT_ADDRESS,
        abi: tokenAbi,
        functionName: 'approve',
        args: [STAKING_CONTRACT_ADDRESS, ethers.constants.MaxUint256],
      };
      
      const approveResult = await approveWrite(approveConfig);
      
      if (approveResult?.hash) {
        toast({
          title: 'İşlem Başlatıldı',
          description: 'Token onayı bekleniyor...',
          status: 'info',
          duration: 5000,
          position: 'top-right',
          isClosable: true,
        });

        const approveReceipt = await waitForTransaction({ hash: approveResult.hash });
        
        if (approveReceipt.status === 'success') {
          toast({
            title: 'İşlem Başarılı!',
            description: 'Token onayı verildi',
            status: 'success',
            duration: 5000,
            position: 'top-right',
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Token onayı başarısız oldu.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsApproveLoading(false);
    }
  };

  const handleStake = async () => {
    try {
      if (!isConnected) {
        toast({
          title: 'Hata',
          description: 'Lütfen önce cüzdanınızı bağlayın.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      if (!stakeAmount) {
        toast({
          title: 'Hata',
          description: 'Lütfen stake miktarını girin.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      setIsStaking(true);
      
      const config = {
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'stake',
        args: [parseEther(stakeAmount.toString())],
      };
      
      const result = await stakeWrite(config);
      
      if (result?.hash) {
        toast({
          title: 'İşlem Başlatıldı',
          description: 'Stake işlemi bekleniyor...',
          status: 'info',
          duration: 5000,
          position: 'top-right',
          isClosable: true,
        });

        const receipt = await waitForTransaction({ hash: result.hash });
        
        if (receipt.status === 'success') {
          toast({
            title: 'İşlem Başarılı!',
            description: `${stakeAmount} BOFA stake edildi`,
            status: 'success',
            duration: 5000,
            position: 'top-right',
            isClosable: true,
          });
          updateBalances();
        }
      }
    } catch (error) {
      if (error.message !== "Cannot read properties of undefined (reading 'hash')") {
        console.error('Stake error:', error);
        toast({
          title: 'Hata',
          description: error.message || 'Stake işlemi başarısız oldu.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsStaking(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!isConnected) {
        toast({
          title: 'Hata',
          description: 'Lütfen önce cüzdanınızı bağlayın.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      if (!withdrawAmount) {
        toast({
          title: 'Hata',
          description: 'Lütfen withdraw miktarını girin.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      setIsWithdrawing(true);
      
      const config = {
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'withdraw',
        args: [parseEther(withdrawAmount.toString())],
      };
      
      const result = await withdrawWrite(config);
      
      if (result?.hash) {
        toast({
          title: 'İşlem Başlatıldı',
          description: 'Withdraw işlemi bekleniyor...',
          status: 'info',
          duration: 5000,
          position: 'top-right',
          isClosable: true,
        });

        const receipt = await waitForTransaction({ hash: result.hash });
        
        if (receipt.status === 'success') {
          toast({
            title: 'İşlem Başarılı!',
            description: `${withdrawAmount} BOFA çekildi`,
            status: 'success',
            duration: 5000,
            position: 'top-right',
            isClosable: true,
          });
          updateBalances();
        }
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Withdraw işlemi başarısız oldu.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleCollectRewards = async () => {
    try {
      if (!isConnected) {
        toast({
          title: 'Hata',
          description: 'Lütfen önce cüzdanınızı bağlayın.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      if (parseFloat(earnedRewards) <= 0) {
        toast({
          title: 'Hata',
          description: 'Toplanacak ödül yok.',
          status: 'error',
          duration: 5000,
        });
        return;
      }

      setIsCollecting(true);
      
      const config = {
        address: STAKING_CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'getReward',
      };
      
      const result = await collectWrite(config);
      
      if (result?.hash) {
        toast({
          title: 'İşlem Başlatıldı',
          description: 'Ödül toplama işlemi bekleniyor...',
          status: 'info',
          duration: 5000,
          position: 'top-right',
          isClosable: true,
        });

        const receipt = await waitForTransaction({ hash: result.hash });
        
        if (receipt.status === 'success') {
          toast({
            title: 'İşlem Başarılı!',
            description: 'Ödüller başarıyla toplandı',
            status: 'success',
            duration: 5000,
            position: 'top-right',
            isClosable: true,
          });
          updateBalances();
        }
      }
    } catch (error) {
      console.error('Collect error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Ödül toplama işlemi başarısız oldu.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCollecting(false);
    }
  };

  useEffect(() => {
    if (account) {
      updateBalances()
    }
  }, [account, stakingContract])

  // USD değerlerini güncelle
  useEffect(() => {
    if (tokenPrice > 0) {
      const stakedUsd = (parseFloat(stakedAmount) * tokenPrice).toFixed(2)
      const earnedUsd = (parseFloat(earnedRewards) * tokenPrice).toFixed(2)
      setStakedUsdValue(stakedUsd)
      setEarnedUsdValue(earnedUsd)
    }
  }, [tokenPrice, stakedAmount, earnedRewards])

  useEffect(() => {
    // 2 saniye sonra splash screen'i kapat
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSwapClick = async () => {
    try {
      setIsSwapOpen(true)
    } catch (error) {
      console.error('Swap error:', error)
    }
  }

  const handleInvestmentClick = async () => {
    try {
      setIsInvestmentOpen(true)
    } catch (error) {
      console.error('Investment error:', error)
    }
  }

  const handlePerpLendingClick = async () => {
    try {
      setIsPerpLendingOpen(true)
    } catch (error) {
      console.error('Perp/Lending error:', error)
    }
  }

  const handleStakePercentageChange = (value) => {
    setStakePercentage(value)
    if (tokenBalance) {
      const maxAmount = ethers.utils.formatEther(tokenBalance)
      const amount = (parseFloat(maxAmount) * value / 100).toFixed(18)
      setStakeAmount(amount)
    } else {
      setStakeAmount('0')
    }
  }

  const handleWithdrawPercentageChange = (value) => {
    setWithdrawPercentage(value)
    if (stakedAmount) {
      const amount = (parseFloat(stakedAmount) * value / 100).toFixed(18)
      setWithdrawAmount(amount)
    }
  }

  // Buton durumları için kontroller
  const isMintButtonDisabled = !isConnected || isMinting || isMintLoading
  const isStakeButtonDisabled = !isConnected || isStaking || isStakeLoading || isApproving || !stakeAmount || parseFloat(stakeAmount) <= 0 || !tokenBalance || parseFloat(ethers.utils.formatEther(tokenBalance)) < parseFloat(stakeAmount)
  const isWithdrawButtonDisabled = !isConnected || isWithdrawing || isWithdrawLoading || !withdrawAmount
  const isCollectButtonDisabled = !isConnected || isCollecting || isCollectLoading || parseFloat(earnedRewards) <= 0

  // Update balances when data changes
  useEffect(() => {
    if (userStakedAmount) {
      setStakedAmount(ethers.utils.formatEther(userStakedAmount))
    }
    if (earnedAmount) {
      setEarnedRewards(ethers.utils.formatEther(earnedAmount))
    }
    if (totalStakedAmount) {
      setTvl(ethers.utils.formatEther(totalStakedAmount))
    }
  }, [userStakedAmount, earnedAmount, totalStakedAmount])

  const { data: lastUpdateTime } = useContractRead({
    address: STAKING_CONTRACT_ADDRESS,
    abi: stakingAbi,
    functionName: 'lastUpdateTime',
    watch: true,
  })

  useEffect(() => {
    if (lastUpdateTime) {
      setStakingStartTime(Number(lastUpdateTime))
    }
  }, [lastUpdateTime])

  // Event dinleme için useEffect
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        // REWARD_RATE'i oku
        const { data: rewardRateValue } = await publicClient.readContract({
          address: STAKING_CONTRACT_ADDRESS,
          abi: stakingAbi,
          functionName: 'REWARD_RATE'
        });

        if (rewardRateValue) {
          console.log('Reward Rate:', rewardRateValue?.toString());
          
          // Kalan ödüller = Reward Rate * Staking Duration
          const remainingRewardsAmount = rewardRateValue.mul(STAKING_DURATION);
          
          console.log('Remaining Rewards:', ethers.utils.formatEther(remainingRewardsAmount));
          setRemainingRewards(ethers.utils.formatEther(remainingRewardsAmount));
        }
      } catch (error) {
        console.error('Rewards fetch error:', error);
        setRemainingRewards('0');
      }
    }

    if (isConnected) {
      fetchRewards();
      const interval = setInterval(fetchRewards, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, publicClient]);

  if (loading) {
    return (
      <Fade in={true}>
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0" 
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          bg="gray.900"
          zIndex="9999"
        >
          {/* Blockchain Animation */}
          <Box
            position="relative"
            width="300px"
            height="300px"
            sx={{
              '@keyframes rotate-chains': {
                '0%': {
                  transform: 'rotate(0deg)',
                  filter: 'drop-shadow(0 0 15px #805AD5)'
                },
                '50%': {
                  transform: 'rotate(180deg)',
                  filter: 'drop-shadow(0 0 30px #805AD5)'
                },
                '100%': {
                  transform: 'rotate(360deg)',
                  filter: 'drop-shadow(0 0 15px #805AD5)'
                }
              },
              '@keyframes pulse-blocks': {
                '0%': { opacity: 0.5, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1.1)' },
                '100%': { opacity: 0.5, transform: 'scale(0.8)' }
              }
            }}
          >
            {/* Dış Halka */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              borderRadius="full"
              border="3px solid"
              borderColor="purple.500"
              animation="rotate-chains 8s linear infinite"
            />
            
            {/* Orta Halka */}
            <Box
              position="absolute"
              top="50px"
              left="50px"
              right="50px"
              bottom="50px"
              borderRadius="full"
              border="3px solid"
              borderColor="purple.400"
              animation="rotate-chains 6s linear infinite reverse"
            />

            {/* İç Halka */}
            <Box
              position="absolute"
              top="100px"
              left="100px"
              right="100px"
              bottom="100px"
              borderRadius="full"
              border="3px solid"
              borderColor="purple.300"
              animation="rotate-chains 4s linear infinite"
            />

            {/* Merkezdeki Bloklar */}
            <SimpleGrid
              columns={2}
              spacing={4}
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="100px"
            >
              {[...Array(4)].map((_, i) => (
                <Box
                  key={i}
                  width="40px"
                  height="40px"
                  bg="purple.500"
                  borderRadius="lg"
                  animation="pulse-blocks 2s ease-in-out infinite"
                  animationDelay={`${i * 0.5}s`}
                  boxShadow="0 0 20px #805AD5"
                />
              ))}
            </SimpleGrid>
          </Box>

          {/* Logo ve Text */}
          <Box
            as={FaGithub}
            boxSize="80px"
            mt={8}
            opacity={0.8}
            color="purple.400"
            sx={{
              filter: 'drop-shadow(0 0 10px #805AD5)'
            }}
          />
          <Text
            mt={4}
            color="purple.400"
            fontSize="xl"
            fontWeight="bold"
            textAlign="center"
            sx={{
              '@keyframes fade-in-out': {
                '0%': { opacity: 0.4 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.4 }
              },
              animation: 'fade-in-out 2s infinite',
              textShadow: '0 0 10px #805AD5'
            }}
          >
            Bank of Aztech dApp
          </Text>
        </Box>
      </Fade>
    )
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Navbar */}
      <Box 
        borderBottom="1px" 
        borderColor={borderColor} 
        py={{ base: 2, md: 4 }} 
        px={{ base: 2, md: 4 }}
        position="sticky"
        top="0"
        zIndex="sticky"
        bg={bgColor}
      >
        <Container maxW="container.md">
          <Flex 
            align="center" 
            justify="space-between"
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 2, md: 6 }}
          >
            <HStack spacing={3}>
              <Heading 
                size={{ base: 'lg', md: 'md' }}
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
                fontWeight="extrabold"
                whiteSpace="nowrap"
              >
                Bank Of Aztech
              </Heading>
              <Box
                as={GiOwl}
                color="purple.400"
                boxSize="24px"
                sx={{
                  animation: "float 3s ease-in-out infinite",
                  "@keyframes float": {
                    "0%": {
                      transform: "translateY(0px) rotate(0deg)",
                    },
                    "50%": {
                      transform: "translateY(-10px) rotate(10deg)",
                    },
                    "100%": {
                      transform: "translateY(0px) rotate(0deg)",
                    },
                  },
                }}
              />
            </HStack>

            <HStack spacing={2} wrap="nowrap" justify="center" zIndex={2}>
              <Button
                variant="ghost"
                colorScheme="purple"
                leftIcon={<FaExchangeAlt />}
                onClick={handleSwapClick}
                pointerEvents="auto"
                cursor="pointer"
                _hover={{
                  bg: 'whiteAlpha.200',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)'
                }}
                transition="all 0.2s"
                size={{ base: 'sm', md: 'md' }}
              >
                Swap/Buy
              </Button>
              
              <Button
                variant="ghost"
                colorScheme="purple"
                leftIcon={<FaChartLine />}
                onClick={handleInvestmentClick}
                _hover={{
                  bg: 'whiteAlpha.200',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)'
                }}
                transition="all 0.2s"
                size={{ base: 'sm', md: 'md' }}
              >
                Investment
              </Button>
            </HStack>

            <HStack spacing={4}>
              <Link 
                href="https://twitter.com/BankofAztech" 
                isExternal
                _hover={{ color: 'purple.400' }}
              >
                <Icon as={FaTwitter} boxSize={5} />
              </Link>
              
              <Link 
                href="https://t.me/BankofAztech" 
                isExternal
                _hover={{ color: 'purple.400' }}
              >
                <Icon as={FaTelegram} boxSize={5} />
              </Link>

              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <Box
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button
                              onClick={openConnectModal}
                              colorScheme="purple"
                              leftIcon={<GiOwl />}
                              _hover={{
                                transform: 'translateY(-2px)',
                                boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)'
                              }}
                              transition="all 0.2s"
                              size={{ base: 'sm', md: 'md' }}
                            >
                              Connect Wallet
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button
                              onClick={openChainModal}
                              colorScheme="red"
                              size={{ base: 'sm', md: 'md' }}
                            >
                              Wrong network
                            </Button>
                          );
                        }

                        return (
                          <HStack spacing={3}>
                            <Button
                              onClick={openChainModal}
                              variant="ghost"
                              colorScheme="purple"
                              size={{ base: 'sm', md: 'md' }}
                              leftIcon={<GiOwl />}
                            >
                              {chain.name}
                            </Button>

                            <Button
                              onClick={openAccountModal}
                              colorScheme="purple"
                              size={{ base: 'sm', md: 'md' }}
                            >
                              {account.displayName}
                            </Button>
                          </HStack>
                        );
                      })()}
                    </Box>
                  );
                }}
              </ConnectButton.Custom>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container 
        maxW="container.md" 
        py={{ base: 3, md: 6 }} 
        px={{ base: 2, md: 4 }} 
        bg="transparent"
        position="relative"
        zIndex={1}
      >
        <VStack spacing={6} align="stretch">
          {/* TVL ve Fiyat Kartı */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <Box 
              p={6} 
              borderRadius="xl" 
              borderWidth={2} 
              borderColor={borderColor}
              bg={statBgColor}
              boxShadow="0 0 10px purple"
            >
              <Stat>
                <StatLabel fontSize="sm">Total Value Locked</StatLabel>
                <StatNumber fontSize="2xl">
                  {formatNumber(tvl)} 
                  <Box as="span" display="inline-flex" alignItems="center">
                    <Text 
                      color="purple.400" 
                      fontWeight="bold"
                      as="span"
                      sx={{
                        animation: "float-text 2s ease-in-out infinite",
                        "@keyframes float-text": {
                          "0%": {
                            transform: "translateY(0)",
                            textShadow: "0 0 0px rgba(128, 90, 213, 0.6)",
                          },
                          "50%": {
                            transform: "translateY(-2px)",
                            textShadow: "0 0 10px rgba(128, 90, 213, 0.8)",
                          },
                          "100%": {
                            transform: "translateY(0)",
                            textShadow: "0 0 0px rgba(128, 90, 213, 0.6)",
                          },
                        },
                      }}
                    >
                      $BOFA
                    </Text>
                  </Box>
                </StatNumber>
                <Text fontSize="md" color="green.400">
                  ${formatNumber(parseFloat(tvl) * tokenPrice)}
                </Text>
              </Stat>
            </Box>
            <Box 
              p={6} 
              borderRadius="xl" 
              borderWidth={2} 
              borderColor={borderColor}
              bg={statBgColor}
              boxShadow="0 0 10px purple"
            >
              <Stat>
                <StatLabel fontSize="sm">BOFA Price</StatLabel>
                <StatNumber fontSize="2xl" color="green.400">${formatNumber(tokenPrice, 4)}</StatNumber>
              </Stat>
            </Box>
          </SimpleGrid>

          {/* Perps/Lend Kartı */}
          <Box
            p={6}
            borderRadius="xl"
            borderWidth={2}
            borderColor={borderColor}
            bg={statBgColor}
            boxShadow="0 0 10px purple"
            cursor="pointer"
            onClick={handlePerpLendingClick}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 0 20px purple',
              bg: 'whiteAlpha.200'
            }}
            transition="all 0.2s"
            position="relative"
            zIndex={2}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePerpLendingClick();
              }
            }}
          >
            <HStack spacing={4} justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="bold" color="purple.400">
                  Perps & Lending
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Trade with leverage or earn interest
                </Text>
              </VStack>
              <HStack spacing={2}>
                <Box
                  position="relative"
                  width="24px"
                  height="24px"
                  borderRadius="full"
                  overflow="hidden"
                  animation="pulse 2s ease-in-out infinite"
                >
                  <Image src="https://pbs.twimg.com/profile_images/1834685932525830150/2Y42289I_400x400.jpg" alt="AVAX" width="100%" height="100%" objectFit="cover" />
                </Box>
                <Icon as={FaExchangeAlt} color="purple.400" boxSize={3} />
                <Text color="purple.400" fontWeight="bold">$BOFA</Text>
              </HStack>
            </HStack>
          </Box>

          {/* BOFA Perps Contract Card */}
          <Box
            p={6}
            borderRadius="xl"
            borderWidth={2}
            borderColor={borderColor}
            bg={statBgColor}
            boxShadow="0 0 10px purple"
            position="relative"
            zIndex={2}
          >
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color="purple.400">
                    Bank Of Aztech Mint Yield
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {PERPS_CONTRACT_ADDRESS}
                  </Text>
                </VStack>
                <HStack>
                  <Button
                    variant="ghost"
                    colorScheme="purple"
                    size="sm"
                    onClick={() => setIsInfoModalOpen(true)}
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <Icon as={FaInfoCircle} />
                  </Button>
                  <Link
                    href={`https://snowtrace.io/address/${PERPS_CONTRACT_ADDRESS}`}
                    isExternal
                    _hover={{ color: 'purple.400' }}
                  >
                    <Icon as={FaExternalLinkAlt} color="purple.400" boxSize={5} />
                  </Link>
                </HStack>
              </HStack>

              <Button
                colorScheme="purple"
                size="lg"
                onClick={handleMint}
                isLoading={isMinting || isMintLoading}
                loadingText="Minting..."
                isDisabled={!isConnected || isMinting || isMintLoading}
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)'
                }}
                transition="all 0.2s"
              >
                Mint BOFA
              </Button>
            </VStack>
          </Box>

          {/* Cycle Bilgileri Kartı */}
          <Box
            p={{ base: 3, md: 6 }}
            borderRadius="xl"
            borderWidth={2}
            borderColor={borderColor}
            bg={statBgColor}
            boxShadow="0 0 10px purple"
            position="relative"
            zIndex={2}
            mb={{ base: 3, md: 6 }}
          >
            <VStack spacing={{ base: 2, md: 4 }} align="stretch">
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="purple.400">
                Active Cycle Information
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 2, md: 4 }}>
                <VStack align="start" spacing={{ base: 1, md: 2 }}>
                  <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>Reward Per Mint</Text>
                  <Text fontSize={{ base: "lg", md: "xl" }} color="green.400">
                    {currentCycleInfo ? formatNumber(ethers.utils.formatEther(currentCycleInfo[2])) : '0'} BOFA
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    ≈ ${currentCycleInfo ? formatNumber(parseFloat(ethers.utils.formatEther(currentCycleInfo[2])) * tokenPrice, 2) : '0'}
                  </Text>
                </VStack>

                <VStack align="start" spacing={{ base: 1, md: 2 }}>
                  <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>Remaining Mints</Text>
                  <Text fontSize={{ base: "lg", md: "xl" }} color="purple.400">
                    {currentCycleInfo ? currentCycleInfo[7].toString() : '0'}
                  </Text>
                </VStack>

                <VStack align="start" spacing={{ base: 1, md: 2 }}>
                  <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>Total Cycle Reward</Text>
                  <Text fontSize={{ base: "lg", md: "xl" }} color="green.400">
                    {currentCycleInfo ? formatNumber(ethers.utils.formatEther(currentCycleInfo[1])) : '0'} BOFA
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    ≈ ${currentCycleInfo ? formatNumber(parseFloat(ethers.utils.formatEther(currentCycleInfo[1])) * tokenPrice, 2) : '0'}
                  </Text>
                </VStack>

                <VStack align="start" spacing={{ base: 1, md: 2 }}>
                  <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>Remaining Cycle Reward</Text>
                  <Text fontSize={{ base: "lg", md: "xl" }} color="green.400">
                    {currentCycleInfo ? formatNumber(ethers.utils.formatEther(currentCycleInfo[5])) : '0'} BOFA
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    ≈ ${currentCycleInfo ? formatNumber(parseFloat(ethers.utils.formatEther(currentCycleInfo[5])) * tokenPrice, 2) : '0'}
                  </Text>
                </VStack>
              </SimpleGrid>

              <Divider borderColor="whiteAlpha.300" my={{ base: 2, md: 4 }} />

              <VStack align="start" spacing={{ base: 2, md: 3 }}>
                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color="purple.400">
                  Requirements
                </Text>
                <HStack>
                  <Icon as={FaCheckCircle} color="green.400" boxSize={{ base: 4, md: 5 }} />
                  <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>Minimum 1 BOFA balance required</Text>
                </HStack>
                <HStack>
                  <Icon as={FaInfoCircle} color="purple.400" boxSize={{ base: 4, md: 5 }} />
                  <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>Each address can mint only once per cycle</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>

          {/* Info Modal */}
          <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent
              bg="gray.800"
              borderWidth={2}
              borderColor="purple.500"
              boxShadow="0 0 20px purple"
            >
              <ModalHeader color="purple.400">Bank Of Aztech Mint Yield System</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color="purple.400" mb={2}>
                      How Does It Work?
                    </Text>
                    <VStack align="start" spacing={3}>
                      <Text color="gray.400">
                        • Each cycle distributes a specific amount of BOFA rewards
                      </Text>
                      <Text color="gray.400">
                        • Minters earn direct rewards and reflection rewards
                      </Text>
                      <Text color="gray.400">
                        • Each cycle has a limited number of mint rights
                      </Text>
                      <Text color="gray.400">
                        • Previous minters also earn rewards through the reflection system
                      </Text>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontSize="lg" fontWeight="bold" color="purple.400" mb={2}>
                      Potential Earnings
                    </Text>
                    <VStack align="start" spacing={3}>
                      <Text color="gray.400">
                        1. Direct Mint Reward: Instant BOFA reward for each mint
                      </Text>
                      <Text color="gray.400">
                        2. Reflection Reward: Earn a share from subsequent mints
                      </Text>
                      <Text color="gray.400">
                        3. Early Participation Advantage: Early minters receive more reflections
                      </Text>
                    </VStack>
                  </Box>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Ödül İstatistikleri */}
          <Box 
            p={6} 
            borderRadius="xl" 
            borderWidth={2} 
            borderColor={borderColor}
            bg={statBgColor}
            boxShadow="0 0 10px purple"
            position="relative"
            zIndex={1}
            mb={4}
          >
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Text fontSize="xl" fontWeight="bold" color="purple.400">Maximum Reward Distribution</Text>
                <Link
                  href="https://snowtrace.io/address/0x72C4ABEb42B175ab06c1BA4897530D49f0c5f77B/contract/43114/readContract?chainid=43114"
                  isExternal
                  _hover={{ color: 'purple.400' }}
                >
                  <Icon as={FaExternalLinkAlt} color="purple.400" boxSize={5} />
                </Link>
              </Flex>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Box p={4} borderRadius="lg" borderWidth={1} borderColor="whiteAlpha.200">
                  <VStack align="start">
                    <Text color="gray.400">10 Years</Text>
                    <Text fontSize="lg" color="white">3,000,000 BOFA</Text>
                    <Text fontSize="sm" color="green.400">${formatNumber(3000000 * tokenPrice)}</Text>
                  </VStack>
                </Box>

                <Box p={4} borderRadius="lg" borderWidth={1} borderColor="whiteAlpha.200">
                  <VStack align="start">
                    <Text color="gray.400">Per Month</Text>
                    <Text fontSize="lg" color="white">{formatNumber(3000000 / 120)} BOFA</Text>
                    <Text fontSize="sm" color="green.400">${formatNumber((3000000 / 120) * tokenPrice)}</Text>
                  </VStack>
                </Box>

                <Box p={4} borderRadius="lg" borderWidth={1} borderColor="whiteAlpha.200">
                  <VStack align="start">
                    <Text color="gray.400">Per Week</Text>
                    <Text fontSize="lg" color="white">{formatNumber(3000000 / 520)} BOFA</Text>
                    <Text fontSize="sm" color="green.400">${formatNumber((3000000 / 520) * tokenPrice)}</Text>
                  </VStack>
                </Box>

                <Box p={4} borderRadius="lg" borderWidth={1} borderColor="whiteAlpha.200">
                  <VStack align="start">
                    <Text color="gray.400">Per Day</Text>
                    <Text fontSize="lg" color="white">{formatNumber(3000000 / 3650)} BOFA</Text>
                    <Text fontSize="sm" color="green.400">${formatNumber((3000000 / 3650) * tokenPrice)}</Text>
                  </VStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* User Stats */}
          <SimpleGrid 
            columns={{ base: 1, md: 2 }} 
            spacing={4} 
            mb={8}
            position="relative"
            zIndex={1}
          >
            {/* Staked Amount */}
            <Box 
              p={6} 
              borderRadius="xl" 
              borderWidth={2} 
              borderColor="purple.500"
              bg={statBgColor}
              boxShadow="0 0 10px purple"
            >
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text color={textColor} fontSize="lg">Your Staked Amount</Text>
                </HStack>
                <HStack spacing={2} alignItems="center">
                  <Text color={textColor} fontSize="2xl" fontWeight="bold">
                    {formatNumber(stakedAmount)} 
                    <Box as="span" display="inline-flex" alignItems="center">
                      <Text 
                        color="purple.400" 
                        fontWeight="bold"
                        as="span"
                        sx={{
                          animation: "float-text 2s ease-in-out infinite",
                          "@keyframes float-text": {
                            "0%": {
                              transform: "translateY(0)",
                              textShadow: "0 0 0px rgba(128, 90, 213, 0.6)",
                            },
                            "50%": {
                              transform: "translateY(-2px)",
                              textShadow: "0 0 10px rgba(128, 90, 213, 0.8)",
                            },
                            "100%": {
                              transform: "translateY(0)",
                              textShadow: "0 0 0px rgba(128, 90, 213, 0.6)",
                            },
                          },
                        }}
                      >
                        $BOFA
                      </Text>
                    </Box>
                  </Text>
                </HStack>
                <Text color="green.400" fontSize="sm">
                  ${formatNumber(parseFloat(stakedAmount) * tokenPrice)}
                </Text>
              </VStack>
            </Box>

            {/* Earned Rewards */}
            <Box 
              p={6} 
              borderRadius="xl" 
              borderWidth={2} 
              borderColor="purple.500"
              bg={statBgColor}
              boxShadow="0 0 10px purple"
            >
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text color={textColor} fontSize="lg">Earned Reward</Text>
                </HStack>
                <HStack spacing={2} alignItems="center">
                  <Text color={textColor} fontSize="2xl" fontWeight="bold">
                    {formatNumber(earnedRewards)} 
                    <Box as="span" display="inline-flex" alignItems="center">
                      <Text 
                        color="purple.400" 
                        fontWeight="bold"
                        as="span"
                        sx={{
                          animation: "float-text 2s ease-in-out infinite",
                          "@keyframes float-text": {
                            "0%": {
                              transform: "translateY(0)",
                              textShadow: "0 0 0px rgba(128, 90, 213, 0.6)",
                            },
                            "50%": {
                              transform: "translateY(-2px)",
                              textShadow: "0 0 10px rgba(128, 90, 213, 0.8)",
                            },
                            "100%": {
                              transform: "translateY(0)",
                              textShadow: "0 0 0px rgba(128, 90, 213, 0.6)",
                            },
                          },
                        }}
                      >
                        $BOFA
                      </Text>
                    </Box>
                  </Text>
                </HStack>
                <Text color="green.400" fontSize="sm">
                  ${formatNumber(parseFloat(earnedRewards) * tokenPrice)}
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* İşlem Kartı */}
          <Box
            p={6}
            borderRadius="xl"
            borderWidth={2}
            borderColor={borderColor}
            bg={statBgColor}
            boxShadow="0 0 10px purple"
            w="full"
          >
            <VStack spacing={8}>
              {/* Stake Slider */}
              <VStack spacing={4} w="full">
                <Flex justify="space-between" w="full">
                  <Text color="purple.400">Stake Percentage</Text>
                  <Text color="gray.400">
                    {stakeAmount ? `${formatNumber(stakeAmount)} BOFA` : '0 BOFA'}
                  </Text>
                </Flex>
                <Slider
                  value={stakePercentage}
                  onChange={handleStakePercentageChange}
                  min={1}
                  max={100}
                  step={1}
                >
                  <SliderTrack bg="whiteAlpha.200" h="3px">
                    <SliderFilledTrack bg="purple.500" />
                  </SliderTrack>
                  <SliderThumb boxSize={6} bg="purple.500">
                    <Text fontSize="xs" color="white">{stakePercentage}%</Text>
                  </SliderThumb>
                </Slider>
              </VStack>

              {/* Withdraw Slider */}
              <VStack spacing={4} w="full">
                <Flex justify="space-between" w="full">
                  <Text color="purple.400">Withdraw Percentage</Text>
                  <Text color="gray.400">
                    {withdrawAmount ? `${formatNumber(withdrawAmount)} BOFA` : '0 BOFA'}
                  </Text>
                </Flex>
                <Slider
                  value={withdrawPercentage}
                  onChange={handleWithdrawPercentageChange}
                  min={1}
                  max={100}
                  step={1}
                >
                  <SliderTrack bg="whiteAlpha.200" h="3px">
                    <SliderFilledTrack bg="purple.500" />
                  </SliderTrack>
                  <SliderThumb boxSize={6} bg="purple.500">
                    <Text fontSize="xs" color="white">{withdrawPercentage}%</Text>
                  </SliderThumb>
                </Slider>
              </VStack>

              {/* Buttons */}
              <SimpleGrid columns={{ base: 1, sm: 4 }} spacing={4} w="full">
                <Button
                  colorScheme="blue"
                  onClick={handleApprove}
                  size="lg"
                  isLoading={isApproveLoading}
                  loadingText="Approving..."
                  isDisabled={!isConnected}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 15px rgba(66, 153, 225, 0.6)'
                  }}
                  transition="all 0.2s"
                >
                  Stake Approve
                </Button>

                <Button
                  colorScheme="green"
                  onClick={handleStake}
                  size="lg"
                  isLoading={isStaking || isStakeLoading}
                  loadingText="Staking..."
                  isDisabled={isStakeButtonDisabled}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 15px rgba(72, 187, 120, 0.6)'
                  }}
                  transition="all 0.2s"
                >
                  Stake {stakePercentage}%
                </Button>

                <Button
                  colorScheme="red"
                  onClick={handleWithdraw}
                  size="lg"
                  isLoading={isWithdrawing || isWithdrawLoading}
                  loadingText="Withdrawing..."
                  isDisabled={isWithdrawButtonDisabled}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 15px rgba(245, 101, 101, 0.6)'
                  }}
                  transition="all 0.2s"
                >
                  Withdraw {withdrawPercentage}%
                </Button>

                <Button
                  colorScheme="purple"
                  onClick={handleCollectRewards}
                  size="lg"
                  isLoading={isCollecting || isCollectLoading}
                  loadingText="Collecting..."
                  isDisabled={isCollectButtonDisabled}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)'
                  }}
                  transition="all 0.2s"
                >
                  Collect
                </Button>
              </SimpleGrid>

              {/* Transaction Info Box */}
              {lastTransactionHash && (
                <Box mt={4} p={4} borderRadius="md" borderWidth={1} borderColor="purple.500" bg="whiteAlpha.200">
                  <VStack spacing={2} align="start">
                    <Text color="purple.400" fontSize="md" fontWeight="bold">Son İşlem Detayı:</Text>
                    <Link href={`https://snowtrace.io/tx/${lastTransactionHash}`} isExternal color="purple.500" fontSize="md">
                      <HStack>
                        <Text>Transaction Hash: {lastTransactionHash.slice(0, 10)}...{lastTransactionHash.slice(-8)}</Text>
                        <ExternalLinkIcon mx="2px" />
                      </HStack>
                    </Link>
                    <Link href={`https://snowtrace.io/tx/${lastTransactionHash}`} isExternal>
                      <Button size="sm" colorScheme="purple" variant="outline" rightIcon={<ExternalLinkIcon />}>
                        Snowtrace'de Görüntüle
                      </Button>
                    </Link>
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>

          {/* Dexscreener Bar */}
          <Box
            mt={6}
            p={6}
            borderRadius="xl"
            borderWidth={2}
            borderColor={borderColor}
            bg={statBgColor}
            boxShadow="0 0 10px purple"
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md" color="purple.400">Active BOFA Pools</Heading>
              <Link
                href={`https://dexscreener.com/avalanche/${DEXSCREENER_PAIR}`}
                isExternal
                _hover={{ textDecoration: 'none' }}
                position="relative"
                zIndex={2}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <HStack
                  p={4}
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor="purple.500"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    transform: 'scale(1.01)',
                    boxShadow: '0 0 10px purple'
                  }}
                  transition="all 0.2s"
                  position="relative"
                  zIndex={2}
                >
                  <VStack align="start" flex={1}>
                    <Text fontWeight="bold">BOFA/AVAX</Text>
                    <Text fontSize="sm" color="gray.400">Click to view on Dexscreener</Text>
                  </VStack>
                  <Icon as={FaExternalLinkAlt} />
                </HStack>
              </Link>
            </VStack>
          </Box>

          {lastTransactionHash && (
            <Box mt={4} p={4} borderRadius="md" borderWidth={1} borderColor="purple.500">
              <VStack spacing={2} align="start">
                <Text color="purple.400">Son İşlem:</Text>
                <Link href={`https://snowtrace.io/tx/${lastTransactionHash}`} isExternal color="purple.500">
                  {lastTransactionHash.slice(0, 10)}...{lastTransactionHash.slice(-8)} <ExternalLinkIcon mx="2px" />
                </Link>
              </VStack>
            </Box>
          )}
        </VStack>

        {/* Investment Modal */}
        <Modal 
          isOpen={isInvestmentOpen} 
          onClose={() => setIsInvestmentOpen(false)}
          isCentered
          size="xl"
          zIndex={1500}
        >
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent 
            bg="gray.900"
            borderWidth={2}
            borderColor="purple.500"
            boxShadow="0 0 20px purple"
          >
            <ModalCloseButton 
              color="whiteAlpha.900"
              _hover={{ color: 'purple.400' }}
            />
            <ModalBody p={6}>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="purple.400">BOFA Investment Pools</Heading>
                
                {/* Total TVL Box */}
                <Box
                  p={4}
                  borderRadius="lg"
                  borderWidth={2}
                  borderColor="purple.500"
                  bg="whiteAlpha.50"
                  boxShadow="0 0 10px purple"
                >
                  <Stat>
                    <StatLabel fontSize="sm" color="purple.400">Total Liquidity Across All Pools</StatLabel>
                    <StatNumber fontSize="2xl" color="white">
                      ${liquidityPools.reduce((total, pool) => total + (pool.liquidity || 0), 0).toLocaleString()}
                    </StatNumber>
                    <Text fontSize="sm" color="gray.400">
                      (Excluding staked BOFA)
                    </Text>
                  </Stat>
                </Box>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {liquidityPools.map((pool, index) => (
                    <Box
                      key={index}
                      p={4}
                      borderRadius="lg"
                      borderWidth={1}
                      borderColor="purple.500"
                      bg="whiteAlpha.50"
                      opacity={pool.type === 'main' ? 1 : 0.8}
                      _hover={{
                        transform: 'scale(1.01)',
                        boxShadow: '0 0 10px purple',
                        opacity: 1
                      }}
                      transition="all 0.2s"
                    >
                      <Link
                        href={`https://dexscreener.com/avalanche/${pool.pair}`}
                        isExternal
                        _hover={{ textDecoration: 'none' }}
                      >
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" color="white">{pool.name}</Text>
                            <Icon as={FaExternalLinkAlt} color="white" />
                          </HStack>
                          <Text fontSize="sm" color="white">Liquidity: <Text as="span" color="green.400">${formatNumber(pool.liquidity)}</Text></Text>
                          <Text fontSize="sm" color="white">Price: <Text as="span" color="green.400">${formatNumber(pool.price, 4)}</Text></Text>
                          <Text fontSize="sm" color="green.400">24h Volume: ${formatNumber(pool.volume24h)}</Text>
                          <Badge colorScheme="purple">{pool.dex}</Badge>
                        </VStack>
                      </Link>
                    </Box>
                  ))}
                </SimpleGrid>

                <Text fontSize="sm" color="gray.400" textAlign="center" mt={4}>
                  Data updates every minute. Click on any pool to view more details.
                </Text>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Swap Modal */}
        <Modal 
          isOpen={isSwapOpen} 
          onClose={() => setIsSwapOpen(false)}
          isCentered
          size="sm"
          zIndex={1400}
        >
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent 
            bg="transparent" 
            boxShadow="none"
            maxW="375px"
          >
            <ModalCloseButton 
              color="whiteAlpha.900"
              _hover={{ color: 'purple.400' }}
              zIndex={2}
            />
            <ModalBody p={0}>
              <iframe
                src="https://swap.dodoex.io/BofaSwap?full-screen=true"
                width="375px"
                height="494px"
                frameBorder="0"
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 0 20px purple',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        <PerpLendingModal 
          isOpen={isPerpLendingOpen} 
          onClose={() => setIsPerpLendingOpen(false)}
          zIndex={1400}
        />

        <Fade in={loading}>
          <VStack
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.8)"
            zIndex={9999}
            justify="center"
            spacing={4}
            pointerEvents={loading ? "auto" : "none"}
          >
            <SimpleGrid
              columns={2}
              spacing={4}
              width="100px"
              height="100px"
            >
              {[...Array(4)].map((_, i) => (
                <Box
                  key={i}
                  bg="purple.500"
                  borderRadius="lg"
                  boxShadow="0 0 20px purple"
                  sx={{
                    animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`
                  }}
                />
              ))}
            </SimpleGrid>
            <Text color="white" fontSize="lg">Loading...</Text>
          </VStack>
        </Fade>

        <Box as="style" dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0% {
                transform: scale(0.8);
                opacity: 0.5;
              }
              50% {
                transform: scale(1.2);
                opacity: 1;
              }
              100% {
                transform: scale(0.8);
                opacity: 0.5;
              }
            }
          `
        }} />
      </Container>
    </Box>
  )
}

export default App 