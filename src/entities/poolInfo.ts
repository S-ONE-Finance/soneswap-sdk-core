import { ConfigMasterFarmer, Farm } from 'interfaces'
export class PoolInfo {
  public readonly pool: Farm
  public readonly configMasterFarmer: ConfigMasterFarmer

  public constructor(
      pool_: Farm,
      configMasterFarmer_: ConfigMasterFarmer
    ) {
    this.pool = pool_
    this.configMasterFarmer = configMasterFarmer_
  }
}
