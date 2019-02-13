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
    return await this.memberRepository.find({where: { status: { inq: ['passed', 'founder']}}});
  }

  /**
   * Returns the count of members.
   */
  @get('/members/getMembersCount', {
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
  async countMembers(): Promise<number> {
    return await this.memberRepository.count({ status: { inq: ['passed', 'founder']}, shares: { gte: 1 }}).then(async result => {
      return await result.count;
    });
  }

  /**
   * Returns all existing contributors.
   */
  @get('/members/getContributors', {
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
  async findContributors(): Promise<Member[]> {
    return await this.memberRepository.find({ where: { status: { inq: ['passed', 'founder']}, shares: { gte: 1, lt: 100 }}});
  }

  /**
   * Returns all existing elders.
   */
  @get('/members/getElders', {
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
  async findElders(): Promise<Member[]> {
    return await this.memberRepository.find({ where: { status: { inq: ['passed', 'founder']}, shares: { gte: 100 }}});
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
        if (member.status === 'passed' || member.status === 'founder') {
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
