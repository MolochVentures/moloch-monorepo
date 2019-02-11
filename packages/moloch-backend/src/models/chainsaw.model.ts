import {Entity, model, property} from '@loopback/repository';

@model({settings: {"strict":false}})
export class Chainsaw extends Entity {
  @property({
    type: 'number',
    required: true,
  })
  block: number;

  @property({
    type: 'number',
    id: true,
    required: true,
  })
  id: number;

  constructor(data?: Partial<Chainsaw>) {
    super(data);
  }
}
