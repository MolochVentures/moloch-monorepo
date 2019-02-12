import {
  repository,
  AnyType,
} from '@loopback/repository';
import {
  get,
  param,
} from '@loopback/rest';
import {
  Period
} from '../models';
import {
  MemberRepository,
  PeriodRepository,
  ProjectRepository
} from '../repositories';

export class PeriodController {
  constructor(
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
    @repository(PeriodRepository)
    public periodRepository: PeriodRepository,
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) { }

  /**
   * Returns periods filtered according to the request's data.
   * @param currentDate: current date to filter the periods.
   */
  @get('/periods/getfiltered', {
    responses: {
      '200': {
        description: 'Returned filtered periods.',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': AnyType } },
          },
        },
      },
    },
  })
  async find(
    @param.query.string('currentDate') currentDate: string,
  ): Promise<any> {
    let organizedPeriods = {
      inqueue: [] as Array<any>,
      votingperiod: [] as Array<any>,
      graceperiod: [] as Array<any>,
      passed: [] as Array<any>,
      failed: [] as Array<any>,
    }

    return await this.memberRepository.find().then(async members => {
      members.forEach(member => {
        if (member.status !== 'founder') {
          switch (member.status) {
            case 'inqueue':
              organizedPeriods.inqueue.push(member);
              break;
            case 'passed':
              organizedPeriods.passed.push(member);
              break;
            case 'failed':
              organizedPeriods.failed.push(member);
              break;
            case 'votingperiod':
              organizedPeriods.votingperiod.push(member);
              break;
            case 'graceperiod':
              organizedPeriods.graceperiod.push(member);
              break;
          }
        }
      });
      return await this.projectRepository.find().then(async projects => {
        projects.forEach(project => {
          switch (project.status) {
            case 'inqueue':
              organizedPeriods.inqueue.push(project);
              break;
            case 'passed':
              organizedPeriods.passed.push(project);
              break;
            case 'failed':
              organizedPeriods.failed.push(project);
              break;
            case 'votingperiod':
              organizedPeriods.votingperiod.push(project);
              break;
            case 'graceperiod':
              organizedPeriods.graceperiod.push(project);
              break;
          }
        });
        return await organizedPeriods;
      });
    });
  }
}
