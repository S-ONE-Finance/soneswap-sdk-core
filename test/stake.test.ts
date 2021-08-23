import { PoolInfo, JSBI, UserInfoSone } from '../src'

describe('Stake', () => {
  const poolInfo = new PoolInfo(JSBI.BigInt(1000), JSBI.BigInt(5), JSBI.BigInt(10))

  describe('#total staked value', () => {
    it('success', () => {
      const userInfo = new UserInfo(poolInfo, JSBI.BigInt(500))
      expect(userInfo.getTotalStakedValueAfterStake(JSBI.BigInt(100))).toEqual(JSBI.BigInt(600))
    })
  })

  describe('#get earned reward', () => {
    it('success', () => {
      const userInfo = new UserInfo(poolInfo, JSBI.BigInt(500))
      const earnedValue = userInfo.getEarnedRewardAfterStake(JSBI.BigInt(10), JSBI.BigInt(5), JSBI.BigInt(100))
      expect(earnedValue).toEqual(JSBI.BigInt(2)) // ((10*5*10)/100) * (100+500)/(100+1000)
    })
  })

  describe('#get apy', () => {
    it('success', () => {
      const userInfo = new UserInfo(poolInfo, JSBI.BigInt(500))
      const apy = userInfo.getAPYAfterStake(
        JSBI.BigInt(500000000000000000), // sone price * 10**18
        JSBI.BigInt(10),
        JSBI.BigInt(5),
        JSBI.BigInt(1000000000000000000), // staked usd price * 10**18
        JSBI.BigInt(100)
      )
      expect(apy).toEqual(JSBI.BigInt(227)) // ((10*5*10)/100) * (sone price)/((staked usd price / 1000)* (1000+100)) * 100
    })
  })
})
