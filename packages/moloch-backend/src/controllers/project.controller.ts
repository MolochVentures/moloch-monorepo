import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
} from '@loopback/rest';
import { Project } from '../models';
import { ProjectRepository } from '../repositories';

export class ProjectController {
  constructor(
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) { }

  /**
   * Returns all existing projects.
   */
  @get('/projects', {
    responses: {
      '200': {
        description: 'Returned all projects.',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Project } },
          },
        },
      },
    },
  })
  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find();
  }

  /**
   * Returns a project filtered by its id.
   * @param id: id of the project to be returned.
   */
  @get('/projects/{id}', {
    responses: {
      '200': {
        description: 'Returned project by id.',
        content: { 'application/json': { schema: { 'x-ts-type': Project } } },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Project> {
    return await this.projectRepository.findById(id);
  }
}
