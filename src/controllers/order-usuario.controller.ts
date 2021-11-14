import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Order,
  Usuario,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderUsuarioController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/usuario', {
    responses: {
      '200': {
        description: 'Usuario belonging to Order',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Usuario)},
          },
        },
      },
    },
  })
  async getUsuario(
    @param.path.string('id') id: typeof Order.prototype.id,
  ): Promise<Usuario> {
    return this.orderRepository.usuario(id);
  }
}
