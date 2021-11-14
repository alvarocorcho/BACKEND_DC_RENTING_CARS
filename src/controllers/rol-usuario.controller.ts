import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Rol,
  Usuario,
} from '../models';
import {RolRepository} from '../repositories';

export class RolUsuarioController {
  constructor(
    @repository(RolRepository)
    public rolRepository: RolRepository,
  ) { }

  @get('/rols/{id}/usuario', {
    responses: {
      '200': {
        description: 'Usuario belonging to Rol',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Usuario)},
          },
        },
      },
    },
  })
  async getUsuario(
    @param.path.string('id') id: typeof Rol.prototype.id,
  ): Promise<Usuario> {
    return this.rolRepository.usuario(id);
  }
}
