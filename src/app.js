require('./config/config');

const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const mongoose = require('mongoose'); 

const bodyParser = require('body-parser');

const servicioUsuario = require('./servicios/servicioUsuario');
const servicioCursos = require('./servicios/serviciodecursos');
const servicioInscripcion = require('./servicios/servicioInscripcion');

const directorioPublico = path.join(__dirname ,'../public');
const directorioPartials = path.join(__dirname ,'../partials');
const directorioHelpers = path.join(__dirname ,'../helpers');

app.use(bodyParser.urlencoded({extended : false}));


app.use(express.static(directorioPublico));

hbs.registerPartials(directorioPartials);
//hbs.registerHelpers(directorioHelpers);

// requires para trabajar con mongoose
const UsuarioMongo  = require('./models/usuarios');
const CursoMongo  = require('./models/cursos');
const InscripcionMongo  = require('./models/inscripciones');

app.set('view engine', 'hbs');

//usuario global, compartido por diferentes sessiones
let auth = {};
 

 app.get('/', (req,res) => {
	res.render('index');
}); 

app.get('/login', (req,res) => {
	res.render('login');
}); 

app.post('/login', (req,res) => {
    auth = servicioUsuario.login(req.body.id,req.body.pass);

	let mensajeError;
	if(auth){
		pagina = 'index';
		auth.isAdmin = auth.rol == 'coordinador';
		auth.isAspirante = auth.rol == 'aspirante';
		auth.isEnSession = true;
	}
	else{
		pagina = 'login';
		mensajeError = 'Identificacion o clave incorrectos';
	}
	res.render(pagina, {
		errorMsg : mensajeError,
		auth : auth
	});
}); 

app.get('/logout', (req,res) => {
	auth = {};
	res.render('index');
}); 

app.get('/crearUsuario', (req,res) => {

		UsuarioMongo.findOne({id : req.query.id},(err,respuesta)=>{
					if (err){
						return console.log(err)
				}


				res.render('crearUsuario', {
					usuario : respuesta,
					auth : auth
		});
	});
}); 


app.post('/crearUsuario', (req,res) => {

	let usuarioMongo = new UsuarioMongo ({
	  	id: parseInt(req.body.id),		
		nombre: req.body.nombre,
		correo: req.body.correo,
		telefono: req.body.telefono,					
		clave: req.body.clave,	
	    rol: 'aspirante'	  
	})

	usuarioMongo.save((err, resultado) => {
		if (err){
			msg = err;
			}	
		else{
		msg = 'Usuario creado';
	        }
	 
	    res.render('crearUsuario', {
		error : msg,
		auth : auth
	    });	

	}); 
}); 

app.get('/listarUsuarios', (req,res) => {
	verificarAcceso(auth, '/listarUsuarios', res);


	UsuarioMongo.find({},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('listaUsuarios',{
			listausuarios : respuesta,
			auth : auth			
		})
	})

});



app.post('/actualizarUsuario', (req,res) => {
	verificarAcceso(auth, '/actualizarUsuario', res);


	       //Estudiante.findById(req.session.usuario, (err, usuario) =>{
			//UsuarioMongo.findById(req.id, (err, usuario) =>{

			UsuarioMongo.findOneAndUpdate({id: req.body.id}, req.body , {new : true}, (err, resultados) =>{	
					if (err){


								res.render('crearUsuario', {
								usuario : resultados,
								error : err,
								auth : auth
							    });


					}	else{

						msg = 'Usuario ' + req.body.id + ' actualizado exitosamente';
						res.render('crearUsuario', {
								  	usuario : resultados,  // resultados es el valor que esta trayendo de la DB
								  	auth : auth,
								    error : msg
						});
			        }

		     });
	
}); 


app.get('/listar', (req,res) => {
	verificarAcceso(auth, '/listar', res);
	
	//listar cursos disponibles
	CursoMongo.find({'estado': 'disponible'},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('listarcursos',{
			listacursos : respuesta,
			auth : auth			
		})
	})

});


app.get('/listartodos', (req,res) => {
	verificarAcceso(auth, '/listartodos', res);

	//listar cursos disponibles
	CursoMongo.find({},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('listarcursos',{
			listacursos : respuesta,
			auth : auth			
		})
	})

});

app.get('/crear', (req,res) => {
	verificarAcceso(auth, '/crear', res);
	res.render('crearcurso', {
		auth : auth
	});

}); 

app.post('/crear', (req,res) => {
	verificarAcceso(auth, '/crear', res);

		let cursoMongo = new CursoMongo ({
		id: parseInt(req.body.id),		
		nombre: req.body.nombre,
		descripcion: req.body.descripcion,
		valor: req.body.valor,					
		modalidad: req.body.modalidad,	
		intensidad: req.body.intensidad,	
		estado: 'disponible'		  
	    })

	cursoMongo.save((err, resultado) => {
		if (err){
			msg = err;
			}	
		else{
			msg = 'Curso ' + req.body.id + ' creado exitosamente';
	        }
	 
	    res.render('crearcurso', {
		mensajeError : msg,
		auth : auth
	    });	

	}); 	

}); 

app.get('/detallecurso', (req,res) => {
	verificarAcceso(auth, '/detallecurso', res);
	let curso = servicioCursos.mostrardetall(req.query.id);
	res.render('detallecurso',{
		curso : curso,
		auth : auth
	});
}); 


app.get('/inscribirACurso', (req,res) => {
	verificarAcceso(auth, '/inscribirACurso', res);
	let listacursos = servicioCursos.mostrardisponibles();	
	let listausuarios = servicioUsuario.mostrar();		
	res.render('inscribirseCurso',{
		listacursos : listacursos,
		listausuarios: listausuarios,
		auth : auth
	});
}); 

app.post('/inscribirACurso', (req,res) => {
	verificarAcceso(auth, '/inscribirACurso', res);


	let msg = servicioInscripcion.inscribirseCurso(parseInt(req.body.nombreuser),parseInt(req.body.nombrecurso));	


	let listacursos = servicioCursos.mostrardisponibles();	
	res.render('inscribirseCurso',{
		listacursos : listacursos,
		nombreuser: parseInt(req.body.nombreuser),		
		nombrecurso: req.body.nombrecurso,
		mensajeError : msg,
		auth : auth
		});		

});


app.get('/listarinscritos', (req,res) => {
	verificarAcceso(auth, '/listarinscritos', res);
	let listacursos = servicioCursos.mostrardisponibles();	
	let listausuarios = servicioUsuario.mostrar();
	let listainscritos = servicioInscripcion.mostrar();		
	let listainscritoslarge = servicioInscripcion.mostrarinscritos();
	res.render('listarinscritos',{
		listainscritoslarge : listainscritoslarge,
		auth : auth
	});
});


app.get('/desinscribiracurso', (req,res) => {
	verificarAcceso(auth, '/desinscribiracurso', res);
	let listacursos = servicioCursos.mostrardisponibles();	
	let listausuarios = servicioUsuario.mostrar();
    let listainscritoslarge = servicioInscripcion.mostrarinscritos();
    res.render('desinscribircurso',{
		listacursos : listacursos,
		listausuarios: listausuarios,
		listainscritoslarge : listainscritoslarge,
		auth : auth
	});
});


app.post('/desinscribiracurso', (req,res) => {
	verificarAcceso(auth, '/desinscribiracurso', res);
	let msg = servicioInscripcion.eliminar(parseInt(req.body.nombreuser),parseInt(req.body.nombrecurso));	
	let listacursos = servicioCursos.mostrardisponibles();	
	let listausuarios = servicioUsuario.mostrar();
	let listainscritos = servicioInscripcion.mostrar();

	setTimeout(function() {
		console.log('probando el tiempo en post 2')
		let listainscritoslarge = servicioInscripcion.mostrarinscritos();
		res.render('desinscribircurso',{
		nombreuser: parseInt(req.body.nombreuser),		
		nombrecurso: req.body.nombrecurso,
		mensajeError : msg,
		listacursos : listacursos,
		listausuarios: listausuarios,
		listainscritoslarge : listainscritoslarge,
		auth : auth
		});	
	},4000)
		

});

app.get('/cerrarcurso', (req,res) => {	
	verificarAcceso(auth, '/cerrarcurso', res);

	let curso = servicioCursos.cerrarcurso(req.query.id);
	let listainscritoslarge = servicioInscripcion.mostrarinscritos();					
	//res.render('listarinscritos',{
	//	listainscritoslarge : listainscritoslarge,
	//	auth : auth
	//});
	res.redirect('listarinscritos');
}); 


app.get('/eliminarinscripcion', (req,res) => {
	verificarAcceso(auth, '/eliminarinscripcion', res);

	let eliminarinscripcion = servicioInscripcion.eliminar();
	let curso = servicioInscripcion.eliminar(req.query.iduser,req.query.idcurso);
	let listainscritoslarge = servicioInscripcion.mostrarinscritos();					
	/*res.render('listarinscritos',{
		listainscritoslarge : listainscritoslarge,
		auth : auth
	});*/
	res.redirect('listarinscritos');
}); 

app.get('/listarmiscursos', (req,res) => {
	verificarAcceso(auth, '/listarmiscursos', res);

	console.log('auth.id:'+auth.id)
	console.log('auth.nombre:'+auth.nombre)
	console.log('auth.role:'+auth.role)
	console.log('auth.isAdmin:'+auth.isAdmin)

	let listacursosusuario=servicioInscripcion.mostarmiscursos(auth.id);
	res.render('listarmiscursos',{
		listacursosusuario : listacursosusuario,
		auth : auth
	});
});



app.get('/eliminarmicurso', (req,res) => {
	verificarAcceso(auth, '/eliminarmicurso', res);

	let eliminarinscripcion = servicioInscripcion.eliminar();
	let curso = servicioInscripcion.eliminar(req.query.iduser,req.query.idcurso);
	res.redirect('listarmiscursos');
}); 



app.get('*', (req,res) => {
	res.render('index');
});



let verificarAcceso = (auth, recurso, res) => { 
	rol = (auth  && auth.rol  )  ? auth.rol : 'interesado';
 	let puedeIngresar = servicioUsuario.verificarAcceso(rol,recurso);
 	if(!puedeIngresar){
 		res.redirect('/');
 	}
};


mongoose.connect(process.env.URLDB, {useNewUrlParser: true}, (err, resultado) => {
	if (err){
		return console.log(error)
	}
	console.log("conectado")
});

 
app.listen(process.env.PORT, () => {
	console.log('-------------------------------------------------- \n \n La aplicación está escuchando en el puerto ' + process.env.PORT + ' \n INGRESE A: http://127.0.0.1:' + process.env.PORT + '/ \n \n -------------------------------------------------- \n ')	
});