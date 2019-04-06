const fs = require('fs');
const path = require('path');

listaUsuario = []; // un vector que es el que vamos a llenar en Json, inicialmente vacio
const archivojson = path.join(__dirname ,'../../listausuarios.json');

// requires para trabajar con mongoose
const UsuarioMongo  = require('../models/usuarios');

const rolCoordinador = 'coordinador';

const recursosxrol = [
	{rol : 'interesado', recursos : ['/listar','/detallecurso', '/crearUsuario']},
	{rol : 'aspirante' , recursos : ['/listar','/listarmiscursos','/inscribirACurso', '/crearUsuario', '/eliminarmicurso']}
];


let login = (id, clave) => {
	listar();
	let usuario = listaUsuario.find(identi => (identi.id == id  && identi.clave == clave) ); 
	return (usuario);
}



 const listar = ()  => {
    try {	
	//listaUsuario = require('../../listausuarios.json'); // TRAE (lee) EL LISTADO DE USUARIOS EXISTENTE
	  listaUsuario = JSON.parse(fs.readFileSync(archivojson, 'utf8')); // lectura sincrona
	} catch {  // se va para aqui si el archivo buscado no existe
		let usuarioAdmin = {
	  id: '1',	  
	  nombre: 'admin',    //datos que quedan dentro del objeto est
	  correo: 'natacb@gmail.com',
	  telefono: 'telefono',
	  clave: 'admin',
	  rol: 	 rolCoordinador 	  
	  };
		listaUsuario = [usuarioAdmin]; 	
	}
 }

const crear = (id, nombre, correo, telefono, clave	) => {
	  listar();
	  let msg;


	let usuarioMongo = new UsuarioMongo ({
	  id: id,	  
	  nombre: nombre,    //datos que quedan dentro del objeto est
	  correo: correo,
	  telefono: telefono,
	  clave: clave,
	  rol: 'aspirante'	  
	})


// parabuscar los duplicados la llave sera el id	 
	

	usuarioMongo.save((err, resultado) => {
		if (err){
			//msg = 'ya existe un usuario con esta identificacion';
			//return err;
			msg = err;

			}					
	});	


    return msg;


}




const actualizar = (id, nombre, correo, telefono, rol	) => {
	  listar();
	  let msg;


	   let existe = listaUsuario.find(identi => identi.id == id); 
	 if (!existe){
	 	return 'No debe modificar la identificacion del usuario.';
	 }

	  let usuarioDb = {
	  id: id,	  
	  nombre: nombre,    //datos que quedan dentro del objeto est
	  correo: correo,
	  telefono: telefono,
	  clave: existe.clave,
	  rol: rol	  	  
	  };


    listaUsuario =  listaUsuario.filter(identi => identi.id != id);


	  listaUsuario.push(usuarioDb);  // almacenar el objeto dentro del  vector lista 
	  guardar(); // guarda lo q esta en lista dentro de datos  - esos datos en el archivo
	 
	
}



const guardar = ()  => {
	let datos = JSON.stringify(listaUsuario);        // guarda en string la variable lista cursos dentro de json
	fs.writeFile('listausuarios.json', datos, (err)=>{
		     if (err) throw (err);
				console.log ('Archivo guardado' );  // de lo contrario archivo creado con exito
	})
}

const mostrar = ()  => {
	listar() // esto trae el archivo listado.json, solo falta imprimirlo en pantalla

	return listaUsuario;
}

const mostrardetall = (ide)  => {
	listar() // esto trae el archivo listado.json, solo falta imprimirlo en pantalla
	let est = listaUsuario.find(buscar => buscar.id == ide); 
	 if (!est){
			est = 'no existe un usuario con ese id';
	 }

	return est;
}


const verificarAcceso = (rol,recurso)  => {
	listar() // esto trae el archivo listado.json, solo falta imprimirlo en pantalla
	//el coordinador puede acceder a cualquier recurso
	if(rolCoordinador == rol){
		return true;
	}

	let recxrol = recursosxrol.find(rxr => rxr.rol == rol); 
	let response = false;
	 if (recxrol){
	 	let recursos = recxrol.recursos;
		let tienePermiso = recursos.find(rec => rec == recurso); 
		response = tienePermiso  ? true : false;
	 }

	return response;
}


module.exports = {login, crear,mostrar, mostrardetall, actualizar, verificarAcceso};