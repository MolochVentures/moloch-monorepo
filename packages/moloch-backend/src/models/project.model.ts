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
export class Project extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'number',
    required: true,
  })
  tribute: number;

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
    required: true,
  })
  assets: object[];

  @property({
    type: 'array',
    itemType: 'object',
  })
  voters?: Voter[];


  constructor(data?: Partial<Project>) {
    super(data);
  }
}
