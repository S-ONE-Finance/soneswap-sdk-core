import { Price } from './fractions/price'
import { TokenAmount } from './fractions/tokenAmount'
import invariant from 'tiny-invariant'
import JSBI from 'jsbi'
import { pack, keccak256 } from '@ethersproject/solidity'
import { getCreate2Address } from '@ethersproject/address'

import {
  BigintIsh,
  FACTORY_ADDRESS,
  INIT_CODE_HASH,
  MINIMUM_LIQUIDITY,
  ZERO,
  ONE,
  FIVE,
  _997,
  _1000,
  ChainId
} from '../constants'
import { sqrt, parseBigintIsh } from '../utils'
import { InsufficientReservesError, InsufficientInputAmountError } from '../errors'
import { Token } from './token'

let PAIR_ADDRESS_CACHE: { [token0Address: string]: { [token1Address: string]: string } } = {}

export class Pair {
  public readonly liquidityToken: Token
  private readonly tokenAmounts: [TokenAmount, TokenAmount]

  public static getAddress(tokenA: Token, tokenB: Token): string {
    if (tokenA.chainId !== tokenB.chainId) {
      throw new Error('Different chainId of tokenA and tokenB')
    }

    const chainId = tokenA.chainId && tokenB.chainId
    const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

    if (PAIR_ADDRESS_CACHE?.[tokens[0].address]?.[tokens[1].address] === undefined) {
      PAIR_ADDRESS_CACHE = {
        ...PAIR_ADDRESS_CACHE,
        [tokens[0].address]: {
          ...PAIR_ADDRESS_CACHE?.[tokens[0].address],
          [tokens[1].address]: getCreate2Address(
            FACTORY_ADDRESS[chainId],
            keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
            INIT_CODE_HASH[chainId]
          )
        }
      }
    }

    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address]
  }

  public constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount) {
    const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    this.liquidityToken = new Token(
      tokenAmounts[0].token.chainId,
      Pair.getAddress(tokenAmounts[0].token, tokenAmounts[1].token),
      18,
      'UNI-V2',
      'Uniswap V2'
    )
    this.tokenAmounts = tokenAmounts as [TokenAmount, TokenAmount]
  }

  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  public involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1)
  }

  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  public get token0Price(): Price {
    return new Price(this.token0, this.token1, this.tokenAmounts[0].raw, this.tokenAmounts[1].raw)
  }

  /**
   * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
   */
  public get token1Price(): Price {
    return new Price(this.token1, this.token0, this.tokenAmounts[1].raw, this.tokenAmounts[0].raw)
  }

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  public priceOf(token: Token): Price {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.token0Price : this.token1Price
  }

  /**
   * Returns the chain ID of the tokens in the pair.
   */
  public get chainId(): ChainId {
    return this.token0.chainId
  }

  public get token0(): Token {
    return this.tokenAmounts[0].token
  }

  public get token1(): Token {
    return this.tokenAmounts[1].token
  }

  public get reserve0(): TokenAmount {
    return this.tokenAmounts[0]
  }

  public get reserve1(): TokenAmount {
    return this.tokenAmounts[1]
  }

  public reserveOf(token: Token): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.reserve0 : this.reserve1
  }

  public getOutputAmount(inputAmount: TokenAmount): [TokenAmount, Pair] {
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError()
    }
    const inputReserve = this.reserveOf(inputAmount.token)
    const outputReserve = this.reserveOf(inputAmount.token.equals(this.token0) ? this.token1 : this.token0)
    const inputAmountWithFee = JSBI.multiply(inputAmount.raw, _997)
    const numerator = JSBI.multiply(inputAmountWithFee, outputReserve.raw)
    const denominator = JSBI.add(JSBI.multiply(inputReserve.raw, _1000), inputAmountWithFee)
    const outputAmount = new TokenAmount(
      inputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      JSBI.divide(numerator, denominator)
    )
    if (JSBI.equal(outputAmount.raw, ZERO)) {
      throw new InsufficientInputAmountError()
    }
    return [outputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))]
  }

  public getInputAmount(outputAmount: TokenAmount): [TokenAmount, Pair] {
    invariant(this.involvesToken(outputAmount.token), 'TOKEN')
    if (
      JSBI.equal(this.reserve0.raw, ZERO) ||
      JSBI.equal(this.reserve1.raw, ZERO) ||
      JSBI.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.token).raw)
    ) {
      throw new InsufficientReservesError()
    }

    const outputReserve = this.reserveOf(outputAmount.token)
    const inputReserve = this.reserveOf(outputAmount.token.equals(this.token0) ? this.token1 : this.token0)
    const numerator = JSBI.multiply(JSBI.multiply(inputReserve.raw, outputAmount.raw), _1000)
    const denominator = JSBI.multiply(JSBI.subtract(outputReserve.raw, outputAmount.raw), _997)
    const inputAmount = new TokenAmount(
      outputAmount.token.equals(this.token0) ? this.token1 : this.token0,
      JSBI.add(JSBI.divide(numerator, denominator), ONE)
    )
    return [inputAmount, new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))]
  }

  public getLiquidityMinted(
    totalSupply: TokenAmount,
    tokenAmountA: TokenAmount,
    tokenAmountB: TokenAmount
  ): TokenAmount {
    invariant(totalSupply.token.equals(this.liquidityToken), 'LIQUIDITY')
    const tokenAmounts = tokenAmountA.token.sortsBefore(tokenAmountB.token) // does safety checks
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    invariant(tokenAmounts[0].token.equals(this.token0) && tokenAmounts[1].token.equals(this.token1), 'TOKEN')

    let liquidity: JSBI
    if (JSBI.equal(totalSupply.raw, ZERO)) {
      liquidity = JSBI.subtract(sqrt(JSBI.multiply(tokenAmounts[0].raw, tokenAmounts[1].raw)), MINIMUM_LIQUIDITY)
    } else {
      const amount0 = JSBI.divide(JSBI.multiply(tokenAmounts[0].raw, totalSupply.raw), this.reserve0.raw)
      const amount1 = JSBI.divide(JSBI.multiply(tokenAmounts[1].raw, totalSupply.raw), this.reserve1.raw)
      liquidity = JSBI.lessThanOrEqual(amount0, amount1) ? amount0 : amount1
    }
    if (!JSBI.greaterThan(liquidity, ZERO)) {
      throw new InsufficientInputAmountError()
    }
    return new TokenAmount(this.liquidityToken, liquidity)
  }

  public getLiquidityValue(
    token: Token,
    totalSupply: TokenAmount,
    liquidity: TokenAmount,
    feeOn: boolean = false,
    kLast?: BigintIsh
  ): TokenAmount {
    invariant(this.involvesToken(token), 'TOKEN')
    invariant(totalSupply.token.equals(this.liquidityToken), 'TOTAL_SUPPLY')
    invariant(liquidity.token.equals(this.liquidityToken), 'LIQUIDITY')
    invariant(JSBI.lessThanOrEqual(liquidity.raw, totalSupply.raw), 'LIQUIDITY')

    let totalSupplyAdjusted: TokenAmount
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply
    } else {
      invariant(!!kLast, 'K_LAST')
      const kLastParsed = parseBigintIsh(kLast)
      if (!JSBI.equal(kLastParsed, ZERO)) {
        const rootK = sqrt(JSBI.multiply(this.reserve0.raw, this.reserve1.raw))
        const rootKLast = sqrt(kLastParsed)
        if (JSBI.greaterThan(rootK, rootKLast)) {
          const numerator = JSBI.multiply(totalSupply.raw, JSBI.subtract(rootK, rootKLast))
          const denominator = JSBI.add(JSBI.multiply(rootK, FIVE), rootKLast)
          const feeLiquidity = JSBI.divide(numerator, denominator)
          totalSupplyAdjusted = totalSupply.add(new TokenAmount(this.liquidityToken, feeLiquidity))
        } else {
          totalSupplyAdjusted = totalSupply
        }
      } else {
        totalSupplyAdjusted = totalSupply
      }
    }

    return new TokenAmount(
      token,
      JSBI.divide(JSBI.multiply(liquidity.raw, this.reserveOf(token).raw), totalSupplyAdjusted.raw)
    )
  }

  public getAmountsOutAddOneToken(inputAmount: TokenAmount): [TokenAmount, TokenAmount] {
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    const amountSwap = JSBI.divide(inputAmount.raw, JSBI.BigInt('2'))
    const tokenAmountSwap = new TokenAmount(inputAmount.token, amountSwap)
    const [amountOut] = this.getOutputAmount(tokenAmountSwap)
    return [new TokenAmount(inputAmount.token, amountSwap), amountOut]
  }

  /**
   * 
   * @param inputAmount 
   * @param slippage 
   * @returns [selectedTokenInputAmount: JSBI, selectedAmountMin: JSBI, theOtherAmountMin: JSBI, theOtherOutputAmountMin: JSBI]
   */
  public getAmountsAddOneToken(inputAmount: TokenAmount, slippage: number): [JSBI, JSBI, JSBI, JSBI] {
    invariant(this.involvesToken(inputAmount.token), 'TOKEN')
    if (JSBI.equal(this.reserve0.raw, ZERO) || JSBI.equal(this.reserve1.raw, ZERO)) {
      throw new InsufficientReservesError()
    }
    if (slippage < 0 || slippage > 10000) {
      throw Error(`Unexpected slippage value: ${slippage}`)
    }

    const theOtherToken = inputAmount.token.equals(this.token0) ? this.token1 : this.token0
    // Reverses
    const selectedTokenReserve = this.reserveOf(inputAmount.token)
    const theOtherTokenReserve = this.reserveOf(theOtherToken)
    console.log('selectedTokenReserve', selectedTokenReserve.raw.toString())
    
    // [selectedInputAmount/2, theOtherOutputAmountDesired]
    const [selectedAmountDesired, theOtherOutputAmountDesired] = this.getAmountsOutAddOneToken(inputAmount)
    console.log('selectedAmountDesired', selectedAmountDesired.raw.toString()) // 500000000000000
    console.log('theOtherOutputAmountDesired', theOtherOutputAmountDesired.raw.toString()) // 313
    
    // theOtherOutputAmountMin with slippage
    const theOtherOutputMin = JSBI.divide(JSBI.multiply(theOtherOutputAmountDesired.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000))
    const theOtherOutputAmountMin = new TokenAmount(theOtherToken, theOtherOutputMin)
    console.log('theOtherOutputMin', theOtherOutputMin.toString()) // 311
    
    /** Calculate theOtherAmountDesired
     * Need [a/2; theOtherAmountDesired] ~  [selectedTokenReserve; theOtherTokenReserve] to add liquidity.
     * 
     * theOtherAmountDesired1 = (a/2)*(y - b_desired) / (x + (a/2))
     *                        = selectedAmountDesired*(theOtherTokenReserve - theOtherOutputAmountDesired) / (selectedTokenReserve + selectedTokenReserve)
     * theOtherAmountDesired2 = (a/2)*(y - b_min) / (x + (a/2))
     *                        = selectedAmountDesired*(theOtherTokenReserve - theOtherOutputAmountMin) / (selectedTokenReserve + selectedTokenReserve)
     * 
     * => theOtherAmountDesired = Min[theOtherAmountDesired1, theOtherAmountDesired2]
     */
    const theOtherAmountDesired1 = selectedAmountDesired.multiply(theOtherTokenReserve.subtract(theOtherOutputAmountDesired))
      .divide(selectedTokenReserve.add(selectedTokenReserve))
    console.log('theOtherAmountDesired1', theOtherAmountDesired1.toFixed(18)) // 0.000000000000000157
    const theOtherAmountDesired2 = selectedAmountDesired.multiply(theOtherTokenReserve.subtract(theOtherOutputAmountMin))
      .divide(selectedTokenReserve.add(selectedTokenReserve))
    console.log('theOtherAmountDesired2', theOtherAmountDesired2.toFixed(18)) // 0.000000000000000157

    const multiplier = 10 ** theOtherToken.decimals
    console.log('multiplier', multiplier) // 1000000000000000000
    const theOtherAmountDesired = theOtherAmountDesired1.greaterThan(theOtherAmountDesired2) 
      ? theOtherAmountDesired2.multiply(JSBI.BigInt(multiplier)) : theOtherAmountDesired1.multiply(JSBI.BigInt(multiplier))
    console.log('theOtherAmountDesired', theOtherAmountDesired.toFixed(18)) // 157.416112890123958557

    // get new reserve after swap
    const reserveSelected = JSBI.add(selectedTokenReserve.raw, selectedAmountDesired.raw)
    console.log('reserveSelected', reserveSelected.toString())
    const reserveOtherToken = JSBI.subtract(theOtherTokenReserve.raw, theOtherOutputAmountDesired.raw)
    console.log('reserveOtherToken', reserveOtherToken.toString())

    console.log('=---------------')
    console.log('theOtherAmountDesired', theOtherAmountDesired.quotient.toString())
    console.log('reserveSelected', reserveSelected.toString())
    console.log('reserveOtherToken', reserveOtherToken.toString())
    // selected token can add
    const selectedTokenDesiredAfterSwap = JSBI.divide(JSBI.multiply(theOtherAmountDesired.quotient, reserveSelected), reserveOtherToken)
    console.log('selectedTokenDesiredAfterSwap', selectedTokenDesiredAfterSwap.toString())
    console.log('=---------------')


    // const selectedAmountMin = JSBI.divide(JSBI.multiply(selectedTokenDesiredAfterSwap, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000))
    const selectedAmountMin = JSBI.divide(JSBI.multiply(selectedAmountDesired.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000))
    console.log('selectedAmountMin', selectedAmountMin.toString()) // 497500000000000 - 497143827800002
    const theOtherAmountMin = JSBI.divide(JSBI.multiply(theOtherAmountDesired.quotient, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000))
    console.log('theOtherAmountMin', theOtherAmountMin.toString()) // 156

    return [inputAmount.raw, selectedAmountMin, theOtherAmountMin, theOtherOutputMin]
  }
}
