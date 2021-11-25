import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Llaves} from '../config/llaves';
import {Credenciales, CredencialesCambioPassword, RecuperarClave, Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
import {AutenticacionService} from '../services';
/*import fetch from 'node-fetch';*/
const fetch = require("node-fetch");

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) {}

@post("/identificarUsuario", {
  responses:{
    '200':{
      description: "Identificacion de Usuarios"
    }
  }
})
async identificarUsuario(
  @requestBody() credenciales: Credenciales
){
  let u = await this.servicioAutenticacion.IdentificarUsuario(credenciales.usuario, credenciales.clave);
  if(u){
      let token = this.servicioAutenticacion.GenerarTokenJWT(u);
      return{
        datos:{
          nombre: u.nombres,
          correo: u.email,
          id: u.id,
          rol: u.rolId
        },
        tk: token
      }
  } else {
    throw new HttpErrors[401]("DATOS NO VALIDOS - ACCESO DENEGAGO");
  }
}

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {

    let clave = this.servicioAutenticacion.GenerarClave();
    let claveCifrada = this.servicioAutenticacion.cifrarClave(clave);
    usuario.password = claveCifrada;
    let u = await this.usuarioRepository.create(usuario);

    //PROCESO DE NOTIFICACION AL USUARIO
    let destino = usuario.email;
    let asunto = 'REGISTRO EN LA PLATAFORMA DE DC RENTING CARS'
    let contenido = `Hola ${usuario.nombres}, su usuario es: ${usuario.email} y su contraseña es: ${clave}`;
    fetch(`${Llaves.urlServicioNotificaciones}/envio_correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
    .then((data: any) => {
      console.log(data);
    })
    return u;
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }
//RECORDAR O RECUPERAR CONTRASEÑA USUARIO
  @post("/recordarClave", {
    responses:{
      '200':{
        description: "Recordar Clave Usuarios"
      }
    }
  })
  async recordarClave(
    @requestBody() credenciales: RecuperarClave
  ): Promise<Boolean> {
    let usuario = await this.usuarioRepository.findOne({
      where: {
        email: credenciales.correo
      }
    });
    if (usuario){
      //GENERAR Y CIFRAR CLAVE
      let clave = this.servicioAutenticacion.GenerarClave();
      console.log(clave)
      let claveCifrada = this.servicioAutenticacion.cifrarClave(clave);
      console.log(claveCifrada)
      usuario.password = claveCifrada;
      await this.usuarioRepository.updateById(usuario.id, usuario);

      //ENVIAR NOTIFICACION
      let destino = usuario.email;
      let asunto = 'RECUPERACION CLAVE PLATAFORMA DE DC RENTING CARS'
      let contenido = `Hola ${usuario.nombres}, la solicitud de recuperacion de contraseña ha sido procesada, su usuario es: ${usuario.email} y su contraseña es: ${clave}`;
      fetch(`${Llaves.urlServicioNotificaciones}/envio_correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
      return true;
    } else {
    return false;
    }
  }

//CAMBIO DE CLAVE POR PARTE DEL USUARIO
  @post("/cambiarClave", {
    responses:{
      '200':{
        description: "Cambiar Clave Usuarios"
      }
    }
  })
  async cambiarClave(
    @requestBody() datos: CredencialesCambioPassword
  ): Promise<Boolean> {
    let claveantCifrada = this.servicioAutenticacion.cifrarClave(datos.claveactual);
    let usuario = await this.usuarioRepository.findById(datos.id);
    if (usuario) {
      if (usuario.password == claveantCifrada){
        usuario.password = datos.nuevaclave;
        let claveCifrada = this.servicioAutenticacion.cifrarClave(usuario.password);
        console.log(claveCifrada)
        console.log(datos.nuevaclave)
        usuario.password = claveCifrada;
        await this.usuarioRepository.updateById(datos.id, usuario);
//NOTIFICAR AL USUARIO EL CAMBIO DE CONTRASEÑA
        let destino = usuario.email;
        let asunto = 'CAMBIO CLAVE PLATAFORMA DE DC RENTING CARS'
        let contenido = `Hola ${usuario.nombres}, la solicitud de cambio de contraseña ha sido procesada, su usuario es: ${usuario.email} y su contraseña es: ${datos.nuevaclave}`;
        fetch(`${Llaves.urlServicioNotificaciones}/envio_correo?correo_destino=${destino}&asunto=${asunto}&contenido=${contenido}`)
        return true;
      } else {
        return false;
      }
    }
    return false;
  }


}
