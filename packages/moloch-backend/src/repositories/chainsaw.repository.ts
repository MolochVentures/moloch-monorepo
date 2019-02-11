import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Chainsaw} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ChainsawRepository extends DefaultCrudRepository<
  Chainsaw,
  typeof Chainsaw.prototype.id
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Chainsaw, dataSource);
  }
}
