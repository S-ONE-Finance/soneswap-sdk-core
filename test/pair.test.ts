import { ChainId, Token, Pair, TokenAmount, WETH, Price } from '../src'

describe('Pair', () => {
  // const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'USDC', 'USD Coin')
  // const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'DAI Stablecoin')
  const USDC = new Token(ChainId.ROPSTEN, '0x07865c6E87B9F70255377e024ace6630C1Eaa37F', 18, 'USDC', 'USD Coin')
  const DAI = new Token(ChainId.ROPSTEN, '0xaD6D458402F60fD3Bd25163575031ACDce07538D', 18, 'DAI', 'DAI Stablecoin')

  describe('constructor', () => {
    it('cannot be used for tokens on different chains', () => {
      expect(() => new Pair(new TokenAmount(USDC, '100'), new TokenAmount(WETH[ChainId.RINKEBY], '100'))).toThrow(
        'CHAIN_IDS'
      )
    })
  })

  describe('#getAddress', () => {
    it('returns the correct address', () => {
      expect(Pair.getAddress(USDC, DAI)).toEqual('0xbFb810FcC02F767e579830E0f36c5707701f4eB7')
    })
  })

  describe('#token1', () => {
    it('always is the token that sorts before', () => {
      expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100')).token1).toEqual(DAI)
      expect(new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '100')).token1).toEqual(DAI)
    })
  })
  describe('#token0', () => {
    it('always is the token that sorts after', () => {
      expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100')).token0).toEqual(USDC)
      expect(new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '100')).token0).toEqual(USDC)
    })
  })
  describe('#reserve1', () => {
    it('always comes from the token that sorts before', () => {
      expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '101')).reserve1).toEqual(
        new TokenAmount(DAI, '101')
      )
      expect(new Pair(new TokenAmount(DAI, '101'), new TokenAmount(USDC, '100')).reserve1).toEqual(
        new TokenAmount(DAI, '101')
      )
    })
  })
  describe('#reserve0', () => {
    it('always comes from the token that sorts after', () => {
      expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '101')).reserve0).toEqual(
        new TokenAmount(USDC, '100')
      )
      expect(new Pair(new TokenAmount(DAI, '101'), new TokenAmount(USDC, '100')).reserve0).toEqual(
        new TokenAmount(USDC, '100')
      )
    })
  })

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(new Pair(new TokenAmount(USDC, '101'), new TokenAmount(DAI, '100')).token1Price).toEqual(
        new Price(DAI, USDC, '100', '101')
      )
      expect(new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '101')).token1Price).toEqual(
        new Price(DAI, USDC, '100', '101')
      )
    })
  })

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(new Pair(new TokenAmount(USDC, '101'), new TokenAmount(DAI, '100')).token0Price).toEqual(
        new Price(USDC, DAI, '101', '100')
      )
      expect(new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '101')).token0Price).toEqual(
        new Price(USDC, DAI, '101', '100')
      )
    })
  })

  describe('#priceOf', () => {
    const pair = new Pair(new TokenAmount(USDC, '101'), new TokenAmount(DAI, '100'))
    it('returns price of token in terms of other token', () => {
      expect(pair.priceOf(DAI)).toEqual(pair.token1Price)
      expect(pair.priceOf(USDC)).toEqual(pair.token0Price)
    })

    it('throws if invalid token', () => {
      expect(() => pair.priceOf(WETH[ChainId.ROPSTEN])).toThrow('TOKEN')
    })
  })

  describe('#reserveOf', () => {
    it('returns reserves of the given token', () => {
      expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '101')).reserveOf(USDC)).toEqual(
        new TokenAmount(USDC, '100')
      )
      expect(new Pair(new TokenAmount(DAI, '101'), new TokenAmount(USDC, '100')).reserveOf(USDC)).toEqual(
        new TokenAmount(USDC, '100')
      )
    })

    it('throws if not in the pair', () => {
      expect(() =>
        new Pair(new TokenAmount(DAI, '101'), new TokenAmount(USDC, '100')).reserveOf(WETH[ChainId.ROPSTEN])
      ).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the token1 chainId', () => {
      expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100')).chainId).toEqual(ChainId.ROPSTEN)
      expect(new Pair(new TokenAmount(DAI, '100'), new TokenAmount(USDC, '100')).chainId).toEqual(ChainId.ROPSTEN)
    })
  })
  describe('#involvesToken', () => {
    expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100')).involvesToken(USDC)).toEqual(true)
    expect(new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100')).involvesToken(DAI)).toEqual(true)
    expect(
      new Pair(new TokenAmount(USDC, '100'), new TokenAmount(DAI, '100')).involvesToken(WETH[ChainId.ROPSTEN])
    ).toEqual(false)
  })

  describe('#getAmountsAddOneToken', () => {
    const pair = new Pair(new TokenAmount(USDC, '1000000'), new TokenAmount(DAI, '1000000'))
    const [a, b] = pair.getAmountsOutAddOneToken(new TokenAmount(USDC, '2000'))
    expect(a.toExact()).toEqual('0.000000000000000996') // *1e18 = 996
    expect(b.toExact()).toEqual('0.000000000000001') // *1e18 = 1000
  })
})
