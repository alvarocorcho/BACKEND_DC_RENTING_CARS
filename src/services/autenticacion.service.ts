import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
import {Llaves} from '../config/llaves';

const generador = require("password-generator");
const cryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(/* Add @inject to inject parameters */
    @repository( UsuarioRepository)
    public usuarioRepository: UsuarioRepository
  ) {}

  /*
   * Add service methods here
   */
  GenerarClave() {
    let clave = generador(8,false);
    return clave;
  }

  cifrarClave(clave:string){
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }

  IdentificarUsuario( user: string, clave: string) {
    try{
      let u = this.usuarioRepository.findOne({where: {email: user, password: clave}});
      if(u){
        return u;
      }
      return false;
    } catch{
        return false;
    }
  }

  GenerarTokenJWT(usuario: Usuario) {
    let token = jwt.sign({
      data:{
        rol: usuario.rolId,
        id: usuario.id,
        nombre: usuario.nombres + " " + usuario.apellidos,
        correo: usuario.email
      }
    },
      Llaves.claveJWT);
    return token;
  }

  ValidarTokenJWT(token: string){
    try {
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    } catch {
      return false;
    }
  }

}
