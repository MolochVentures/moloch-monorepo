import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Event} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class EventRepository extends DefaultCrudRepository<
  Event,
  typeof Event.prototype.name
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Event, dataSource);
  }
}
