import JSBI from 'jsbi'

export class PoolInfo {
  public readonly totalStakedValue: JSBI
  public readonly rewardPerBlock: JSBI
  public readonly poolWeight: JSBI

  public constructor(
      totalStakedValue: JSBI, 
      rewardPerBlock: JSBI,
      poolWeight: JSBI,
    ) {
    this.totalStakedValue = totalStakedValue
    this.rewardPerBlock = rewardPerBlock
    this.poolWeight = poolWeight
  }

}
