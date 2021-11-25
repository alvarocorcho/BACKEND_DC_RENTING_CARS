import {Model, model, property} from '@loopback/repository';

@model()
export class CredencialesCambioPassword extends Model {
  @property({
    type: 'string',
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  claveactual: string;

  @property({
    type: 'string',
    required: true,
  })
  nuevaclave: string;


  constructor(data?: Partial<CredencialesCambioPassword>) {
    super(data);
  }
}

export interface CredencialesCambioPasswordRelations {
  // describe navigational properties here
}

export type CredencialesCambioPasswordWithRelations = CredencialesCambioPassword & CredencialesCambioPasswordRelations;
