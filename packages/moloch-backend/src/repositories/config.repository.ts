import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Config} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ConfigRepository extends DefaultCrudRepository<
  Config,
  typeof Config.prototype.id
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Config, dataSource);
  }
}
