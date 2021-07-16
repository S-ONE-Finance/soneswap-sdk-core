interface BaseDataSushi {
  __typename: string
  id: string
}

interface Owner extends BaseDataSushi {
  sushiPerBlock: number
  totalAllocPoint: number
}

interface Token extends BaseDataSushi {
  name: string
  symbol: string
  totalSupply: string
  derivedETH: string
}

interface LiquidityPair extends BaseDataSushi {
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

interface Pair extends BaseDataSushi {}
interface User extends BaseDataSushi {}
export interface Farm extends BaseDataSushi {
  pair: string
  allocPoint: string
  lastRewardBlock: string
  accSushiPerShare: string
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
  sushiRewardPerDay: number
  liquidityPair: LiquidityPair
  rewardPerBlock: number
  roiPerBlock: number
  roiPerYear: number
  tvl: number
  sushiHarvested: number
  multiplier: number
  balanceUSD: number
  sushiPrice: number
  LPTokenPrice: number
  secondsPerBlock: number
}

export interface MyStaked extends BaseDataSushi {
  address: string
  amount: string
  entryUSD: string
  exitUSD: string
  pool: Farm
  rewardDebt: string
  sushiHarvested: string
  sushiHarvestedUSD: string
}

export interface LiquidityPosition extends BaseDataSushi {
  liquidityTokenBalance: string
  pair: Pair
  user: User
}
