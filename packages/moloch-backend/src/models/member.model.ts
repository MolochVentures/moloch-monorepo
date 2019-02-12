import { Entity, model, property } from '@loopback/repository';

@model()
class Voter {
  @property({
    type: 'string',
    required: true,
  })
  member: string;

  @property({
    type: 'string',
    required: true,
  })
  vote: string;

  @property({
    type: 'number',
    required: true,
  })
  shares: number;
}

@model()
class Proposal {
  @property({
    type: 'string',
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'number',
    required: true,
  })
  shares: number;

  @property({
    type: 'number',
    required: true,
  })
  tribute: number;

  @property({
    type: 'string',
    required: true,
  })
  vote: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;
}

@model()
export class Member extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  address: string;

  @property({
    type: 'number',
    required: true,
  })
  nonce: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  title?: string;

  @property({
    type: 'string',
  })
  applicantAddress?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
  })
  shares?: number;

  @property({
    type: 'number',
  })
  tribute?: number;

  @property({
    type: 'string',
  })
  status?: string;

  @property({
    type: 'string',
  })
  period?: string;

  @property({
    type: 'number',
  })
  end?: number;

  @property({
    type: 'number',
  })
  gracePeriod?: number;

  @property({
    type: 'array',
    itemType: 'object',
  })
  assets?: object[];

  @property({
    type: 'array',
    itemType: 'object',
  })
  voters?: Voter[];

  @property({
    type: 'array',
    itemType: 'object',
  })
  proposals?: Proposal[];


  constructor(data?: Partial<Member>) {
    super(data);
  }
}
