import { UserInfoSone as UserInfoInterface } from '../interfaces'
import BigNumber from 'bignumber.js'
import { calculateAPY } from '../utils'
import { PoolInfo } from './poolInfo'
import invariant from 'tiny-invariant'

export class UserInfo {
  public readonly poolInfo: PoolInfo
  public readonly user: UserInfoInterface

  public constructor(poolInfo_: PoolInfo, user_: UserInfoInterface) {
    this.poolInfo = poolInfo_
    this.user = user_
  }

  public getTotalStakedValueAfterStake(newValue: string): string {
    const stakedValue = new BigNumber(this.user.amount ?? '0')
    const newStakedValue = new BigNumber(newValue)
    return stakedValue.plus(newStakedValue).toString()
  }

  public getEarnedRewardAfterStake(newValue: string, block: number): string {
    invariant(+newValue !== 0, 'New value must > 0')
    const poolShare = new BigNumber(newValue)
      .plus(new BigNumber(this.user.amount ?? '0'))
      .div(new BigNumber(newValue).plus(new BigNumber(this.poolInfo.pool.slpBalance)))
    const rewardForUser = new BigNumber(this.poolInfo.pool.rewardPerBlock).times(poolShare)
    const multiplierYear = calculateAPY(this.poolInfo.pool.secondsPerBlock, block, this.poolInfo.configMasterFarmer)
    return (multiplierYear * rewardForUser.toNumber()).toString()
  }

  public getAPYAfterStake(newValue: string, block: number): string {
    invariant(+newValue !== 0, 'New value must > 0')
    const poolShare = new BigNumber(newValue)
      .plus(new BigNumber(this.user.amount ?? '0'))
      .div(new BigNumber(newValue).plus(new BigNumber(this.poolInfo.pool.slpBalance)))
    const interestValue = new BigNumber(
      this.poolInfo.pool.rewardPerBlock * this.poolInfo.pool.sonePrice * poolShare.toNumber()
    )
    const investValue = new BigNumber(newValue)
      .plus(new BigNumber(this.user.amount ?? '0'))
      .times(new BigNumber(this.poolInfo.pool.LPTokenPrice))
      .div(new BigNumber(1e18))
    const roiPerBlock = investValue.eq('0') ? 0 : interestValue.toNumber() / investValue.toNumber()
    const multiplierYear = calculateAPY(this.poolInfo.pool.secondsPerBlock, block, this.poolInfo.configMasterFarmer)
    return (multiplierYear * roiPerBlock).toString()
  }

  public getTotalLPTokenAfterUnstake(currentLPToken: string, newValue: string): string {
    const currentLPTokenValue = new BigNumber(currentLPToken)
    const newUnstakedValue = new BigNumber(newValue)
    return currentLPTokenValue.plus(newUnstakedValue).toString()
  }

  public getRemainStakedValueAfterUnstake(newValue: string): string {
    const stakedValue = new BigNumber(this.user.amount ?? '0')
    const newUnstakedValue = new BigNumber(newValue)
    return stakedValue.minus(newUnstakedValue).toString()
  }
}
