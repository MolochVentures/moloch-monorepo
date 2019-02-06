import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Project} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ProjectRepository extends DefaultCrudRepository<
  Project,
  typeof Project.prototype.id
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Project, dataSource);
  }
}
