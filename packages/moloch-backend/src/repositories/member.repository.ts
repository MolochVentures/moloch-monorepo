import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Member } from '../models';
import { DbDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class MemberRepository extends DefaultCrudRepository<
  Member,
  typeof Member.prototype.address
  > {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Member, dataSource);
  }
}
