import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {Usuario} from './usuario.model';
import {Vehiculo} from './vehiculo.model';

@model()
export class Order extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required:true,
  })
  vehiculoId?: string;

  @property({
    type: 'date',
    required: true,
  })
  fecha: string;

  @property({
    type: 'number',
    required: true,
  })
  cantidadDias: number;

  @property({
    type: 'number',
    required: true,
  })
  precio: number;

  @property({
    type: 'number',
    required: true,
  })
  valorTotal: number;

  @property({
    type: 'string',
    required: true,
  })
  estado: string;

  @belongsTo(() => Usuario)
  usuarioId: string;

  @hasOne(() => Vehiculo)
  vehiculo: Vehiculo;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
