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
const request = require('request');

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

  /**
   * Returns the current data of ETH.
   */
  @get('/assets/getETH', {
    responses: {
      '200': {
        description: 'Returned ETH data.',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Asset } },
          },
        },
      },
    },
  })
  async getETH(): Promise<any> {
    return await request("https://api.coinmarketcap.com/v1/ticker/ethereum/", async function(error: any, response: any, body: any) {
      if (error) return console.log(error);
      return await body;
    });
  }
}
