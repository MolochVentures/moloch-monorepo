import { Entity, model, property } from '@loopback/repository';

@model()
export class Asset extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  address: string;

  @property({
    type: 'string',
  })
  symbol: string;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'number',
  })
  price: number;

  @property({
    type: 'string',
  })
  logo: string;

  @property({
    type: 'string',
  })
  priceFeed: string;

  @property({
    type: 'string',
  })
  txs: string;


  constructor(data?: Partial<Asset>) {
    super(data);
  }
}
