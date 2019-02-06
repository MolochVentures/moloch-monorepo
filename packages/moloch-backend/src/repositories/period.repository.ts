import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Period } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class PeriodRepository extends DefaultCrudRepository<
  Period,
  typeof Period.prototype.id
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Period, dataSource);
  }
}
