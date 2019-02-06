import {
  repository,
} from '@loopback/repository';
import {
  get,
  post,
  param,
  requestBody,
} from '@loopback/rest';
import {
  Config,
  Member
} from '../models';
import {
  ConfigRepository,
  MemberRepository,
  PeriodRepository,
  ProjectRepository
} from '../repositories';
const cron = require("node-cron");

export class ConfigController {
  constructor(
    @repository(ConfigRepository)
    public configRepository: ConfigRepository,
    @repository(MemberRepository)
    public memberRepository: MemberRepository,
    @repository(PeriodRepository)
    public periodRepository: PeriodRepository,
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) { }

  /**
   * Returns a config filtered by its id.
   * @param id: id of the config to be returned.
   */
  @get('/configs/{id}', {
    responses: {
      '200': {
        description: 'Returned config by id.',
        content: { 'application/json': { schema: { 'x-ts-type': Config } } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Config> {
    return await this.configRepository.findById(id);
  }

  /**
   * Creates a config.
   * @param config: config to be created.
   */
  @post('/configs', {
    responses: {
      '200': {
        description: 'Config created.',
        content: { 'application/json': { schema: { 'x-ts-type': Config } } },
      },
    },
  })
  async create(@requestBody() config: Config): Promise<Config> {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    config.id = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    return await this.configRepository.create(config);
  }

  /**
   * Returns the founders.
   */
  @get('/configs/getfounders', {
    responses: {
      '200': {
        description: 'Returned config by id.',
        content: { 'application/json': { schema: { 'x-ts-type': Config } } },
      },
    },
  })
  async getFounders(): Promise<Member[]> {
    return await this.configRepository.find().then(async result => {
      return await this.memberRepository.find({ where: { address: { inq: result[0].founders } } }).then(async members => {
        return members;
      })
    });
  }
}
