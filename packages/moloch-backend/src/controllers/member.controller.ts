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
import { Count } from 'loopback-datasource-juggler';

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
   * Returns all existing members that have at least 1 share.
   */
  @get('/members/getMembersWithShares', {
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
  async findMembersWithShares(): Promise<number> {
    return await this.memberRepository.count({ status: { inq: ['active', 'founder']}, shares: { gte: 1 }}).then(async result => {
      return await result.count;
    });
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
    // Get all the users to calculate the total shares of the system
    return await this.memberRepository.find().then(async members => {
      let totalShares = 0;
      // Only add the shares of the members
      members.forEach(member => {
        if (member.status === 'active' || member.status === 'founder') {
          totalShares = totalShares + (member.shares ? member.shares : 0)
        }
      });
      // Get the user that has been requested
      return await this.memberRepository.findById(id).then(async matchingMember => {
        // Modify the nonce of the user
        matchingMember.nonce = Math.floor(Math.random() * 1000000);
        return await this.memberRepository.updateById(matchingMember.address, matchingMember).then(async modifiedMember => {
          // Return the user with the new nonce
          let result = {
            member: matchingMember,
            totalShares: totalShares
          }
          return result;
        });
      });
    });
  }
}
