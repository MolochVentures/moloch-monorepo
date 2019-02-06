import {
  repository,
  AnyType,
} from '@loopback/repository';
import {
  param,
  get,
} from '@loopback/rest';
import { Member } from '../models';
import { MemberRepository } from '../repositories';

export class MemberController {
  constructor(
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
  ) { }

  /**
   * Returns all existing members.
   */
  @get('/members', {
    responses: {
      '200': {
        description: 'Returned all members.',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Member } },
          },
        },
      },
    },
  })
  async findAll(): Promise<Member[]> {
    return await this.memberRepository.find({where: { status: { inq: ['active', 'founder']}}});
  }

  /**
   * Returns a member filtered by its id.
   * @param id: id of the member to be returned.
   */
  @get('/members/{id}', {
    responses: {
      '200': {
        description: 'Returned member by id.',
        content: { 'application/json': { schema: { 'x-ts-type': AnyType } } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<any> {
    return await this.memberRepository.find().then(async members => {
      let totalShares = 0;
      members.forEach(member => { totalShares = totalShares + (member.shares ? member.shares : 0) });
      return await this.memberRepository.findById(id).then(async matchingMember => {
        let result = {
          member: matchingMember,
          totalShares: totalShares
        }
        return result;
      });
    });
  }
}
