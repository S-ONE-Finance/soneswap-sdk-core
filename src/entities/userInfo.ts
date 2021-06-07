import JSBI from 'jsbi'
import { PoolInfo } from './poolInfo'

export class UserInfo {
  public readonly poolInfo: PoolInfo
  public readonly amount: JSBI

  public constructor(
    poolInfo: PoolInfo, 
    amount: JSBI
  ) {
    this.poolInfo = poolInfo
    this.amount = amount
  }
  
  public getTotalStakedValueAfterStake(stakedValue: JSBI) : JSBI {
    return JSBI.add(this.amount, stakedValue)
  }

  public getEarnedRewardAfterStake(
    multiplier: JSBI,
    rewardPerBlock: JSBI,
    stakedValue: JSBI
  ) : JSBI {
    const rewardPerYear = JSBI.multiply(multiplier, rewardPerBlock)
    const soneMint = JSBI.divide(JSBI.multiply(rewardPerYear , this.poolInfo.poolWeight), JSBI.BigInt(100))
    return JSBI.divide(
      JSBI.multiply(soneMint, JSBI.add(this.amount, stakedValue)),
      JSBI.add(this.poolInfo.totalStakedValue, stakedValue)
    )
  }

  public getAPYAfterStake(
    sonePrice: JSBI,
    multiplier: JSBI,
    rewardPerBlock: JSBI,
    currentUSDValue: JSBI,
    stakedValue: JSBI
  ) : JSBI {
    const rewardPerYear = JSBI.multiply(multiplier, rewardPerBlock)
    const soneMint = JSBI.divide(JSBI.multiply(rewardPerYear, this.poolInfo.poolWeight), JSBI.BigInt(100))
    const valueUSDPerLPToken = JSBI.divide(currentUSDValue, this.poolInfo.totalStakedValue)
    const stakedValueUSD = JSBI.multiply(JSBI.add(this.poolInfo.totalStakedValue, stakedValue), valueUSDPerLPToken)
    const soneMintValueUSD = JSBI.multiply(sonePrice, soneMint)
    return JSBI.divide(JSBI.multiply(soneMintValueUSD, JSBI.BigInt(100)), stakedValueUSD)
  }
}
