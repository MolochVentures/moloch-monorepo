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
      pending: [] as Array<any>,
      inProgress: [] as Array<any>,
      accepted: [] as Array<any>,
      rejected: [] as Array<any>,
    }

    return await this.memberRepository.find().then(async members => {
      members.forEach(member => {
        if (member.status !== 'founder') {
          switch (member.status) {
            case 'pending':
              organizedPeriods.pending.push(member);
              break;
            case 'active':
              organizedPeriods.accepted.push(member);
              break;
            case 'inactive':
              organizedPeriods.rejected.push(member);
              break;
            case 'inprogress':
              organizedPeriods.inProgress.push(member);
              break;
          }
        }
      });
      return await this.projectRepository.find().then(async projects => {
        projects.forEach(project => {
          switch (project.status) {
            case 'pending':
              organizedPeriods.pending.push(project);
              break;
            case 'accepted':
              organizedPeriods.accepted.push(project);
              break;
            case 'rejected':
              organizedPeriods.rejected.push(project);
              break;
            case 'inprogress':
              organizedPeriods.inProgress.push(project);
              break;
          }
        });
        return await organizedPeriods;
      });
    });
  }
}
