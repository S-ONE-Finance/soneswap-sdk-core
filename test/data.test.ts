import { ChainId, WETH, Token, Fetcher } from '../src'

// TODO: replace the provider in these tests
describe('data', () => {
  it('Token', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F') // DAI
    expect(token.decimals).toEqual(18)
  })

  it('Token:CACHE', async () => {
    const token = await Fetcher.fetchTokenData(ChainId.MAINNET, '0xE0B7927c4aF23765Cb51314A0E0521A9645F0E2A') // DGD
    expect(token.decimals).toEqual(9)
  })

  it('Pair', async () => {
    const token = new Token(ChainId.ROPSTEN, '0xaD6D458402F60fD3Bd25163575031ACDce07538D', 18) // DAI
    const pair = await Fetcher.fetchPairData(WETH[ChainId.ROPSTEN], token)
    expect(pair.liquidityToken.address).toEqual('0x9272b8a0618080842c589442d3AFC6daFe4020d7')
  })
})
