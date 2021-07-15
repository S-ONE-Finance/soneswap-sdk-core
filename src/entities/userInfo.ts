import { MyStaked } from 'interfaces'
import JSBI from 'jsbi'
import { PoolInfo } from './poolInfo'

export class UserInfo {
  public readonly poolInfo: PoolInfo
  public readonly user: MyStaked

  public constructor(
    poolInfo_: PoolInfo, 
    user_: MyStaked
  ) {
    this.poolInfo = poolInfo_
    this.user = user_
  }
  
  public getTotalStakedValueAfterStake(newValue: string) : string {
    const stakedValue = JSBI.BigInt(this.user.amount)
    const newStakedValue = JSBI.BigInt(newValue)
    return JSBI.add(stakedValue, newStakedValue).toString()
  }

  // public getEarnedRewardAfterStake(newValue: string) : string {
  //   const multiplier = JSBI.BigInt(this.poolInfo.pool.multiplier)
  //   const rewardPerBlock = JSBI.BigInt(this.poolInfo.pool.rewardPerBlock)
  //   const rewardPerYear = JSBI.multiply(multiplier, rewardPerBlock)
  //   const soneMint = JSBI.divide(JSBI.multiply(rewardPerYear , this.poolInfo.poolWeight), JSBI.BigInt(100))
  //   return JSBI.divide(
  //     JSBI.multiply(soneMint, JSBI.add(this.amount, stakedValue)),
  //     JSBI.add(this.poolInfo.totalStakedValue, stakedValue)
  //   )
  // }

  // public getAPYAfterStake(
  //   sonePrice: JSBI,
  //   multiplier: JSBI,
  //   rewardPerBlock: JSBI,
  //   currentUSDValue: JSBI,
  //   stakedValue: JSBI
  // ) : JSBI {
  //   const rewardPerYear = JSBI.multiply(multiplier, rewardPerBlock)
  //   const soneMint = JSBI.divide(JSBI.multiply(rewardPerYear, this.poolInfo.poolWeight), JSBI.BigInt(100))
  //   const valueUSDPerLPToken = JSBI.divide(currentUSDValue, this.poolInfo.totalStakedValue)
  //   const stakedValueUSD = JSBI.multiply(JSBI.add(this.poolInfo.totalStakedValue, stakedValue), valueUSDPerLPToken)
  //   const soneMintValueUSD = JSBI.multiply(sonePrice, soneMint)
  //   return JSBI.divide(JSBI.multiply(soneMintValueUSD, JSBI.BigInt(100)), stakedValueUSD)
  // }

  // public getRemainStakedValueAfterUnstake(unstakedValue: JSBI) : JSBI {
  //   return JSBI.subtract(this.amount, unstakedValue)
  // }
}
