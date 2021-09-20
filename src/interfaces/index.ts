interface BaseDataSone {
  __typename: string
  id: string
}

interface Owner extends BaseDataSone {
  sonePerBlock: number
  totalAllocPoint: number
}

interface Token extends BaseDataSone {
  name: string
  symbol: string
  decimals: string
  totalSupply: string
  derivedETH: string
}

interface LiquidityPair extends BaseDataSone {
  reserveUSD: string
  reserveETH: string
  volumeUSD: string
  untrackedVolumeUSD: string
  trackedReserveETH: string
  token0: Token
  token1: Token
  reserve0: string
  reserve1: string
  token0Price: string
  token1Price: string
  totalSupply: string
  txCount: string
  timestamp: string
}

interface Pair extends BaseDataSone {}
interface User extends BaseDataSone {}
export interface Farm extends BaseDataSone {
  pair: string
  allocPoint: string
  lastRewardBlock: string
  accSonePerShare: string
  balance: string
  userCount: string
  owner: Owner
  contract: string
  type: string
  symbol: string
  name: string
  pid: number
  pairAddress: string
  slpBalance: string
  soneRewardPerDay: number
  liquidityPair: LiquidityPair
  rewardPerBlock: number
  roiPerBlock: number
  roiPerYear: number
  tvl: number
  soneHarvested: number
  multiplier: number
  balanceUSD: number
  sonePrice: number
  LPTokenPrice: number
  secondsPerBlock: number
  userInfo?: UserInfoSone
}

export interface UserInfoSone extends BaseDataSone {
  address: string
  amount: string
  entryUSD: string
  exitUSD: string
  pool?: Farm
  rewardDebt: string
  soneHarvested: string
}

export interface LiquidityPosition extends BaseDataSone {
  liquidityTokenBalance: string
  pair: Pair
  user: User
}

export interface ConfigMasterFarmer {
  rewardMultiplier: number[]
  startBlock: number
  blocksPerWeek: number
}
