const fs = require('fs');
const path = require('path');

listaCursos = []; // un vector que es el que vamos a llenar en Json, inicialmente vacio


const archivojson = path.join(__dirname ,'../../listacursos.json');

 const listar = ()  => {
    try {
    listaCursos = JSON.parse(fs.readFileSync(archivojson, 'utf8')); // lectura sincrona
	//listaCursos = require('../../listacursos.json'); // TRAE (lee) EL LISTADO DE CURSOS EXISTENTE
	} catch {  // se va para aqui si el archivo buscado no existe
		listaCursos = []; 	
	}
 }


 const crear = (curso) => {
	  listar();
	  let msg;
	  let cur = {
	  id: curso.id,	  
	  nombre: curso.nombre,    //datos que quedan dentro del objeto est
	  descripcion: curso.descripcion,
	  valor: curso.valor,
	  modalidad: curso.modalidad,
	  intensidad: curso.intensidad,
	  estado: 'disponible'	  	  
	  };
// parabuscar los duplicados la llave sera el id	 
	 let duplicado = listaCursos.find(identi => identi.id == curso.id); 
	 if (!duplicado){
	  listaCursos.push(cur);  // almacenar el objeto dentro del  vector lista cursos
	  msg = 'curso creado exitosamente!!!';
	  guardar(); // guarda lo q esta en lista cursos dentro de datos  - esos datos en el archivo
	 }
	 else
		msg = 'ya existe un curso con ese ID, use otro ID para la creación';


	return msg;
}


 const mostrar = ()  => {
	listar() // esto trae el archivo listado.json, solo falta imprimirlo en pantalla
	console.log ('CURSOS DISPONIBLES');

	return listaCursos;
}

 const mostrardisponibles = ()  => {
	listar() // esto trae el archivo listado.json, solo falta imprimirlo en pantalla
	let disponibles = listaCursos.filter(cur => cur.estado == 'disponible')  // entreg un vector de estudiantes con nota mayor a 3

	if (disponibles.lenght == 0) {
					disponibles = 'no existe un curso con ese id';
	}

	return disponibles;
}


const guardar = ()  => {
	let datos = JSON.stringify(listaCursos);        // guarda en string la variable lista cursos dentro de json
	fs.writeFile('listacursos.json', datos, (err)=>{
		     if (err) throw (err);
				console.log ('Archivo creado' );  // de lo contrario archivo creado con exito
	})
}

const mostrardetall = (ide)  => {
	listar() // esto trae el archivo listado.json, solo falta imprimirlo en pantalla
	let cur = listaCursos.find(buscar => buscar.id == ide); 
	 if (!cur){
			cur = 'no existe un curso con ese id';
	 }

	return cur;
}


const cerrarcurso = (ide)  => {
	listar() // esto trae el archivo listado.json
	
	let encontrado = listaCursos.find(buscar => buscar.id == ide);  // para encontrar el curso
	 if (!encontrado){
		console.log ('curso no encontrado, no se puede actualizar');
	} else {
		encontrado.estado = 'cerrado'; 
		guardar()
	 }
}




	module.exports = {mostrar, crear, guardar, mostrardetall, mostrardisponibles, cerrarcurso};

