import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Asset } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class AssetRepository extends DefaultCrudRepository<
  Asset,
  typeof Asset.prototype.address
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Asset, dataSource);
  }
}
