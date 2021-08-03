import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import JSBI from 'jsbi'
import { getAddress } from '@ethersproject/address'

import { BigintIsh, ZERO, ONE, TWO, THREE, SolidityType, SOLIDITY_TYPE_MAXIMA, START_REWARD_BLOCK, REWARD_MULTIPLIER } from './constants'

export function validateSolidityTypeInstance(value: JSBI, solidityType: SolidityType): void {
  invariant(JSBI.greaterThanOrEqual(value, ZERO), `${value} is not a ${solidityType}.`)
  invariant(JSBI.lessThanOrEqual(value, SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`)
}

// warns if addresses are not checksummed
export function validateAndParseAddress(address: string): string {
  try {
    const checksummedAddress = getAddress(address)
    warning(address === checksummedAddress, `${address} is not checksummed.`)
    return checksummedAddress
  } catch (error) {
    invariant(false, `${address} is not a valid address.`)
  }
}

export function parseBigintIsh(bigintIsh: BigintIsh): JSBI {
  return bigintIsh instanceof JSBI
    ? bigintIsh
    : typeof bigintIsh === 'bigint'
    ? JSBI.BigInt(bigintIsh.toString())
    : JSBI.BigInt(bigintIsh)
}

// mock the on-chain sqrt function
export function sqrt(y: JSBI): JSBI {
  validateSolidityTypeInstance(y, SolidityType.uint256)
  let z: JSBI = ZERO
  let x: JSBI
  if (JSBI.greaterThan(y, THREE)) {
    z = y
    x = JSBI.add(JSBI.divide(y, TWO), ONE)
    while (JSBI.lessThan(x, z)) {
      z = x
      x = JSBI.divide(JSBI.add(JSBI.divide(y, x), x), TWO)
    }
  } else if (JSBI.notEqual(y, ZERO)) {
    z = ONE
  }
  return z
}

// given an array of items sorted by `comparator`, insert an item into its sort index and constrain the size to
// `maxSize` by removing the last item
export function sortedInsert<T>(items: T[], add: T, maxSize: number, comparator: (a: T, b: T) => number): T | null {
  invariant(maxSize > 0, 'MAX_SIZE_ZERO')
  // this is an invariant because the interface cannot return multiple removed items if items.length exceeds maxSize
  invariant(items.length <= maxSize, 'ITEMS_SIZE')

  // short circuit first item add
  if (items.length === 0) {
    items.push(add)
    return null
  } else {
    const isFull = items.length === maxSize
    // short circuit if full and the additional item does not come before the last item
    if (isFull && comparator(items[items.length - 1], add) <= 0) {
      return add
    }

    let lo = 0,
      hi = items.length

    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (comparator(items[mid], add) <= 0) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    items.splice(lo, 0, add)
    return isFull ? items.pop()! : null
  }
}

export function calculateAPY(secondsPerBlock: number, blockCurrent: number): number {
  // define halvingAtBlocks
  const blocksPerWeek = JSBI.BigInt(Math.trunc((24 * 7 * 3600) / secondsPerBlock))
  const rewardMultiplier = REWARD_MULTIPLIER
  const startAtBlock = JSBI.BigInt(START_REWARD_BLOCK)
  const halvingAtBlocks: JSBI[] = []
  for (let i = 0; i < rewardMultiplier.length - 1; i++) {
    const halvingAtBlock = JSBI.add(JSBI.multiply(blocksPerWeek, JSBI.BigInt(i + 1)), startAtBlock)
    halvingAtBlocks.push(halvingAtBlock)
  }
  halvingAtBlocks.push(SOLIDITY_TYPE_MAXIMA[SolidityType.uint256])
  // get multiplier
  const blockAfterYear = JSBI.add(JSBI.BigInt(blockCurrent), JSBI.BigInt(Math.trunc((365 * 24 * 3600) / secondsPerBlock)))
  const multiplier = getMultiplierInYear(
    startAtBlock,
    JSBI.BigInt(blockCurrent),
    blockAfterYear,
    rewardMultiplier,
    halvingAtBlocks
  )
  return JSBI.toNumber(multiplier)
}

function getMultiplierInYear(
  startAtBlock: JSBI,
  blockCurrent: JSBI,
  blockAfterYear: JSBI,
  rewardMultiplier: number[],
  halvingAtBlocks: JSBI[]
): JSBI {
  let result: JSBI = ZERO
  if (JSBI.lessThan(blockCurrent, startAtBlock)) return ZERO
  for (let i = 0; i < halvingAtBlocks.length; i++) {
    const endBlock = halvingAtBlocks[i];
    if (JSBI.lessThanOrEqual(blockAfterYear, endBlock)) {
      let m = JSBI.multiply(JSBI.subtract(blockAfterYear, blockCurrent), JSBI.BigInt(rewardMultiplier[i]))
      return JSBI.add(result, m)
    }
    if (JSBI.lessThan(blockCurrent, endBlock)) {
      const m =  JSBI.multiply(JSBI.subtract(endBlock, blockCurrent), JSBI.BigInt(rewardMultiplier[i]))
      blockCurrent = endBlock;
      result = JSBI.add(result, m)
    }
  }
  return result
}