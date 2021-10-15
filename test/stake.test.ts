import { PoolInfo, Farm, UserInfo } from '../src'

describe('Stake', () => {

  let poolInfo: PoolInfo
  let userInfo: UserInfo

  beforeEach(() => {
    const poolInfoData: Farm = {
      "id": "0",
      "pair": "0xf1eec9e028ce90e53e17add2814827240ef6c74b",
      "allocPoint": "1000",
      "lastRewardBlock": "9456545",
      "accSonePerShare": "3123129921751418444741558",
      "balance": "0.000028452073477406",
      "userCount": "4",
      "soneHarvested": 4721166.061245896567654968,
      "owner": {
        "id": "0x05bf874f71aabf40966489e45de3e5fcdc823927",
        "sonePerBlock": 5000000000000000000,
        "totalAllocPoint": 3500,
        "__typename": "MasterFarmer"
      },
      "__typename": "Pool",
      "contract": "masterchefv1",
      "type": "SLP",
      "symbol": "USDT-SONE",
      "name": "TetherToken SONE Token",
      "pid": 0,
      "pairAddress": "0xf1eec9e028ce90e53e17add2814827240ef6c74b",
      "slpBalance": "28452073477406",
      "soneRewardPerDay": 8236.808236808236,
      "liquidityPair": {
        "id": "0xf1eec9e028ce90e53e17add2814827240ef6c74b",
        "reserveUSD": "257.7011871048996799501502039748476",
        "reserveETH": "0.1748194835491052567824253366622657",
        "volumeUSD": "29.44670120931105095541595787100341",
        "untrackedVolumeUSD": "29.44670120931105095541595787100341",
        "trackedReserveETH": "0.1748194835491052567824253366622657",
        "token0": {
          "id": "0x12cd536e6de4aff412a62482d45433c83ef39ffc",
          "name": "TetherToken",
          "symbol": "USDT",
          "decimals": "6",
          "totalSupply": "16096",
          "derivedETH": "0.0004959137960629249639503549659145917",
          "__typename": "Token"
        },
        "token1": {
          "id": "0x5fea1f4aef9c78bc56ced5083fb59d351396748f",
          "name": "SONE Token",
          "symbol": "SONE",
          "decimals": "18",
          "totalSupply": "16096",
          "derivedETH": "0.0005166537241861130621028664876888106",
          "__typename": "Token"
        },
        "reserve0": "78.694691",
        "reserve1": "261.25075639721951158",
        "token0Price": "0.3012228254770999261232330629905441",
        "token1Price": "3.319801540325249025757023431224859",
        "totalSupply": "0.000143321407243187",
        "txCount": "18",
        "__typename": "Pair",
        "timestamp": "1215487",
      },
      "rewardPerBlock": 1.4285714285714286,
      "roiPerBlock": 0.0010311484493130978,
      "roiPerYear": 5138.328211553489,
      "multiplier": 320,
      "balanceUSD": 51.15867372333453,
      "sonePrice": 0.7587304454742803,
      "LPTokenPrice": 1798064.8673623034,
      "secondsPerBlock": 14.985,
      "userInfo": undefined,
      "tvl": 1458
    }
    
    const configFarmData = {
      "startBlock": 9342011,
      "rewardMultiplier": [
        32,
        32,
        32,
        32,
        16,
        8,
        4,
        2,
        1
      ],
      "blocksPerWeek": 45134
    }
    poolInfo = new PoolInfo(poolInfoData, configFarmData)
    userInfo = new UserInfo(poolInfo, {
      __typename: '',
      address: '',
      amount: '0',
      entryUSD: '0',
      exitUSD: '0',
      id: 'id',
      rewardDebt: '0',
      soneHarvested: '0'
    })
  })
  
  describe('#total staked value', () => {
    it('getTotalStakedValueAfterStake', () => {
      expect(userInfo.getTotalStakedValueAfterStake('1000000000000000000')).toEqual('1000000000000000000')
    })
  })

  describe('#get earned reward', () => {
    it('success', () => {
      const earnedValue = userInfo.getEarnedRewardAfterStake(
        '1000000000000000000',
        9343011
      )
      expect(earnedValue).toEqual('12633360.554697232') 
    })
  })

  describe('#get apy', () => {
    it('success', () => {
      const apy = userInfo.getAPYAfterStake(
        '1000000000000000000',
        9343011
      )
      expect(apy).toEqual('5.330906273456053')
    })
  })
})


