import { Entity, model, property } from '@loopback/repository';

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
  type: string;
}

@model()
export class Period extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  id: string;

  @property({
    type: 'date',
    required: true,
  })
  start: Date;

  @property({
    type: 'date',
    required: true,
  })
  end: Date;

  @property({
    type: 'date',
    required: true,
  })
  gracePeriod: Date;

  @property({
    type: 'array',
    itemType: 'object',
  })
  proposals: Proposal[];


  constructor(data?: Partial<Period>) {
    super(data);
  }
}
