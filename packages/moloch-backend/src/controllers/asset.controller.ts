import {
  repository,
} from '@loopback/repository';
import {
  post,
  get,
  requestBody,
} from '@loopback/rest';
import { Asset } from '../models';
import { AssetRepository } from '../repositories';

export class AssetController {
  constructor(
    @repository(AssetRepository)
    public assetRepository: AssetRepository,
  ) { }

  /**
   * Returns all existing assets.
   */
  @get('/assets', {
    responses: {
      '200': {
        description: 'Returned all assets.',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Asset } },
          },
        },
      },
    },
  })
  async findAll(): Promise<Asset[]> {
    return await this.assetRepository.find();
  }
}
