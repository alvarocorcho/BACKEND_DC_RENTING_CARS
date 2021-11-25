import {Model, model, property} from '@loopback/repository';

@model()
export class RecuperarClave extends Model {
  @property({
    type: 'string',
    required: true,
  })
  correo: string;


  constructor(data?: Partial<RecuperarClave>) {
    super(data);
  }
}

export interface RecuperarClaveRelations {
  // describe navigational properties here
}

export type RecuperarClaveWithRelations = RecuperarClave & RecuperarClaveRelations;
