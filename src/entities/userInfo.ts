import { UserInfo as UserInfoInterface } from '../interfaces'
import JSBI from 'jsbi'
import { calculateAPY } from '../utils'
import { PoolInfo } from './poolInfo'

export class UserInfo {
  public readonly poolInfo: PoolInfo
  public readonly user: UserInfoInterface

  public constructor(poolInfo_: PoolInfo, user_: UserInfoInterface) {
    this.poolInfo = poolInfo_
    this.user = user_
  }

  public getTotalStakedValueAfterStake(newValue: string): string {
    const stakedValue = JSBI.BigInt(this.user.amount)
    const newStakedValue = JSBI.BigInt(newValue)
    return JSBI.add(stakedValue, newStakedValue).toString()
  }

  public getEarnedRewardAfterStake(newValue: string, block: number): string {
    const poolShare =
      (Number(newValue) + Number(this.user.amount)) / (Number(newValue) + Number(this.poolInfo.pool.balance))
    const rewardForUser = this.poolInfo.pool.rewardPerBlock * poolShare
    const multiplierYear = calculateAPY(this.poolInfo.pool.secondsPerBlock, block)
    return (multiplierYear * rewardForUser).toString()
  }

  // public getAPYAfterStake(newValue: string, block: number): string {
  //   const poolShare =
  //     Number(newValue) / (Number(newValue) + Number(this.poolInfo.pool.balance))
  //   const roiPerBlock =
  //     (this.poolInfo.pool.rewardPerBlock * this.poolInfo.pool.sushiPrice * poolShare) /
  //     (Number(newValue) * this.poolInfo.pool.LPTokenPrice / 1e18) 
  //   const multiplierYear = calculateAPY(this.poolInfo.pool.secondsPerBlock, block)
  //   return (multiplierYear * roiPerBlock).toString()
  // }

  public getAPYAfterStake(newValue: string, block: number): string {
    const poolShare =
      (Number(newValue) + Number(this.user.amount)) / (Number(newValue) + Number(this.poolInfo.pool.balance))
    const roiPerBlock =
      (this.poolInfo.pool.rewardPerBlock * this.poolInfo.pool.sushiPrice * poolShare) /
      ((Number(newValue) + Number(this.user.amount)) * this.poolInfo.pool.LPTokenPrice / 1e18) 
    const multiplierYear = calculateAPY(this.poolInfo.pool.secondsPerBlock, block)
    return (multiplierYear * roiPerBlock).toString()
  }
  
  public getTotalLPTokenAfterUnstake(currentLPToken: string, newValue: string) : string {
    const currentLPTokenValue = JSBI.BigInt(currentLPToken)
    const newUnstakedValue = JSBI.BigInt(newValue)
    return JSBI.subtract(currentLPTokenValue, newUnstakedValue).toString()
  }

  public getRemainStakedValueAfterUnstake(newValue: string) : string {
    const stakedValue = JSBI.BigInt(this.user.amount)
    const newUnstakedValue = JSBI.BigInt(newValue)
    return JSBI.subtract(stakedValue, newUnstakedValue).toString()
  }
}
