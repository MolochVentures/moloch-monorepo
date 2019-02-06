import { Entity, model, property } from '@loopback/repository';

@model()
export class Config extends Entity {
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
    type: 'number',
    required: true,
  })
  periodLength: number;

  @property({
    type: 'number',
    required: true,
  })
  gracePeriod: number;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  founders: string[];

  constructor(data?: Partial<Config>) {
    super(data);
  }
}
