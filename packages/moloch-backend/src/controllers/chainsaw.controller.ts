import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Chainsaw} from '../models';
import {ChainsawRepository} from '../repositories';
import { molochContract } from '../web3';
import { EventOptions } from 'web3-eth-contract/types';

export class ChainsawController {
  constructor(
    @repository(ChainsawRepository)
    public chainsawRepository : ChainsawRepository,
  ) {}

  @post('/chainsaw', {
    responses: {
      '200': {
        description: 'Chainsaw model instance',
        content: {'application/json': {schema: {'x-ts-type': Chainsaw}}},
      },
    },
  })
  async create() {
    console.log('hi');
    let latest = await this.chainsawRepository.findOne({
      order: ['block DESC'],
      limit: 1
    })
    console.log('latest: ', latest);

    const fromBlock = latest ? latest.block : 0
    console.log('fromBlock: ', fromBlock);

    const events = await molochContract.getPastEvents("allEvents", { fromBlock, toBlock: "latest" } as EventOptions)
    console.log('events: ', events);
    return
    // return await this.chainsawRepository.create(chainsaw);
  }
}