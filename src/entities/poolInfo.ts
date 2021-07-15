import { Farm } from 'interfaces'
export class PoolInfo {
  public readonly pool: Farm

  public constructor(
      pool_: Farm, 
    ) {
    this.pool = pool_
  }
}
