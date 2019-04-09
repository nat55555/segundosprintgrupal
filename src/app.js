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

const session = require('express-session');

const bcrypt = require('bcrypt');



const directorioPublico = path.join(__dirname ,'../public');
const directorioPartials = path.join(__dirname ,'../partials');
const directorioHelpers = path.join(__dirname ,'../helpers');

app.use(bodyParser.urlencoded({extended : false}));


app.use(express.static(directorioPublico));

app.use(session({
  secret: 'nodonode ultra secret',
  resave: false,
  saveUninitialized: true
}));

hbs.registerPartials(directorioPartials);
//hbs.registerHelpers(directorioHelpers);

// requires para trabajar con mongoose
const UsuarioMongo  = require('./models/usuarios');
const CursoMongo  = require('./models/cursos');
const InscripcionMongo  = require('./models/inscripciones');


const salt = 10;







app.set('view engine', 'hbs');


 app.get('/', (req,res) => {
	res.render('index');
}); 

app.get('/login', (req,res) => {
	res.render('login');
}); 

app.post('/login', (req,res) => {

    UsuarioMongo.findOne({id : req.body.id},(err,respuesta)=>{
					if (err){
						return console.log(err)
					}else{

							let mensajeError;
							if(!respuesta){
								pagina = 'login';
								mensajeError = 'Identificacion o clave incorrectos';
							}
							else{

								if(!bcrypt.compareSync(req.body.pass, respuesta.clave)){
									pagina = 'login';
									mensajeError = 'Identificacion o clave incorrectos';
								}else{
									pagina = 'index';
									let auth = {};
									auth.id = respuesta.id;
									auth.rol = respuesta.rol;
									auth.nombre = respuesta.nombre;
									auth.isAdmin = respuesta.rol == 'coordinador';
									auth.isAspirante = respuesta.rol == 'aspirante';
									auth.isDocente = respuesta.rol == 'docente';									
									auth.isEnSession = true;

									req.session.auth = auth;
								}
								
							}


							res.render(pagina, {
								errorMsg : mensajeError,
								auth : req.session.auth
							});


					}


	});

	
}); 

app.get('/logout', (req,res) => {
	req.session.destroy((err) => {
		if(err){
				console.log(err);
		}
	});
	res.render('index');
}); 

app.get('/crearUsuario', (req,res) => {

		UsuarioMongo.findOne({id : req.query.id},(err,respuesta)=>{
					if (err){
						return console.log(err)
				}


				res.render('crearUsuario', {
					usuario : respuesta,
					auth : req.session.auth
		});
	});
}); 


app.post('/crearUsuario', (req,res) => {
	let usuarioMongo = new UsuarioMongo ({
	  	id: parseInt(req.body.id),		
		nombre: req.body.nombre,
		correo: req.body.correo,
		telefono: req.body.telefono,					
		clave: bcrypt.hashSync(req.body.clave,salt),	
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
		auth : req.session.auth
	    });	

	}); 
}); 

app.get('/listarUsuarios', (req,res) => {
	verificarAcceso(req.session.auth, '/listarUsuarios', res);


	UsuarioMongo.find({},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('listaUsuarios',{
			listausuarios : respuesta,
			auth : req.session.auth			
		})
	})

});



app.post('/actualizarUsuario', (req,res) => {
	verificarAcceso(req.session.auth, '/actualizarUsuario', res);


	       //Estudiante.findById(req.session.usuario, (err, usuario) =>{
			//UsuarioMongo.findById(req.id, (err, usuario) =>{

			UsuarioMongo.findOneAndUpdate({id: req.body.id}, req.body , {new : true}, (err, resultados) =>{	
					if (err){


								res.render('crearUsuario', {
								usuario : resultados,
								error : err,
								auth : req.session.auth
							    });


					}	else{

						msg = 'Usuario ' + req.body.id + ' actualizado exitosamente';
						res.render('crearUsuario', {
								  	usuario : resultados,  // resultados es el valor que esta trayendo de la DB
								  	auth : req.session.auth,
								    error : msg
						});
			        }

		     });
	
}); 


app.get('/listar', (req,res) => {
	verificarAcceso(req.session.auth, '/listar', res);
	
	//listar cursos disponibles
	CursoMongo.find({'estado': 'disponible'},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('listarcursos',{
			listacursos : respuesta,
			auth : req.session.auth			
		})
	})

});


app.get('/listartodos', (req,res) => {
	verificarAcceso(req.session.auth, '/listartodos', res);

	//listar cursos disponibles
	CursoMongo.find({},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('listarcursostodos',{
			listacursos : respuesta,
			auth : req.session.auth			
		})
	})

});

app.get('/crear', (req,res) => {
	verificarAcceso(req.session.auth, '/crear', res);
	res.render('crearcurso', {
		auth : req.session.auth
	});

}); 

app.post('/crear', (req,res) => {
	verificarAcceso(req.session.auth, '/crear', res);

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
		auth : req.session.auth
	    });	

	}); 	

}); 

app.get('/detallecurso', (req,res) => {

	verificarAcceso(req.session.auth, '/detallecurso', res);

	//listar detalle de 1 curso
	CursoMongo.findOne({'id': req.query.id},(err,respuesta)=>{
		if (err){
			return console.log(err)
		}

		res.render ('detallecurso',{
			curso : respuesta,
			auth : req.session.auth			
		})
	})


}); 


app.get('/inscribirACurso', (req,res) => {

	verificarAcceso(req.session.auth, '/inscribirACurso', res);


	//listar cursos disponibles
	CursoMongo.find({'estado': 'disponible'},(err,respuestacursos)=>{
		if (err){
			return console.log(err)
		}

			let listacursos = respuestacursos;

								UsuarioMongo.find({},(err,respuestausuarios)=>{
									if (err){
										return console.log(err)
									}

									let	listausuarios = respuestausuarios;

													res.render('inscribirseCurso',{
														listacursos : listacursos,
														listausuarios: listausuarios,
														auth : req.session.auth
													});


								})

	})


		

}); 

app.post('/inscribirACurso', (req,res) => {
	verificarAcceso(req.session.auth, '/inscribirACurso', res);


	InscripcionMongo.findOne({'curso': req.body.nombrecurso},(err,respuesta)=>{

		let msg;
		let usuarios = [];
		if (err){
			return console.log(err)
		}
	
				if(!respuesta){
				  console.log ('noexiste registro de inscripcion para ese curso');
				
				  usuarios.push(  req.body.nombreuser	);
									let inscripcionMongo = new InscripcionMongo ({
									curso: parseInt(req.body.nombrecurso),		
									usuarios: usuarios  
								    })
									//inscripcionMongo.usuarios = {'usuarios' : usuarios };


								inscripcionMongo.save((err, resultado) => {
									if (err){
										msg = err;
										}	
									else{
										msg = 'inscripcion de ' + req.body.nombreuser + ' creada exitosamente';
								        }
							  				 	return res.render('inscribirseCurso',{
												//LIacursos : listacursos,
												nombreuser: parseInt(req.body.nombreuser),		
												nombrecurso: req.body.nombrecurso,
												mensajeError : msg,
												auth : req.session.auth
												});	

								})

								
					


				}
				else{ 
				  console.log ('SI HAY registro de inscripcion para ese curso');
				  			//InscripcionMongo.findOne({'curso': req.body.nombrecurso, 'usuarios': { "$in" : [req.body.nombreuser]} },(err,respuesta)=>{
				  			//InscripcionMongo.findOne(  { 'usuarios':  req.body.nombreuser } , (err,respuesta)=>{	
				  			InscripcionMongo.findOne( { $and: [ { 'curso': req.body.nombrecurso }, { 'usuarios': { $in : [req.body.nombreuser]} } ] } ,(err,respuesta)=>{	

				  				
				  				if(respuesta){
				  				 	msg = 'usuario ya esta matriculado en ese curso, no se puede matricular de nuevo';
				  				 	return res.render('inscribirseCurso',{
									//LIacursos : listacursos,
									nombreuser: parseInt(req.body.nombreuser),		
									nombrecurso: req.body.nombrecurso,
									mensajeError : msg,
									auth : req.session.auth
									});


				  				}else {
								    
		

				  					//InscripcionMongo.findOneAndUpdate({'curso': req.body.nombrecurso}, {$push: {'usuarios' : req.body.nombreuser}});
									
									InscripcionMongo.findOneAndUpdate({'curso': req.body.nombrecurso}, 
									                    {$push: {'usuarios': 
									                    req.body.nombreuser}}, 
									                    {new: true}, (err, result) => {
									                    		
									                   })									

									msg = 'usuario matriculado exitosamente!!'
											

				  				 	return res.render('inscribirseCurso',{
									//LIacursos : listacursos,
									nombreuser: parseInt(req.body.nombreuser),		
									nombrecurso: req.body.nombrecurso,
									mensajeError : msg,
									auth : req.session.auth
									});																			  						

				  				}



				  			})

				}										




	
	});		

			


});


app.get('/listarinscritos', (req,res) => {
	verificarAcceso(req.session.auth, '/listarinscritos', res);
	/*let listacursos = servicioCursos.mostrardisponibles();	
	let listausuarios = servicioUsuario.mostrar();
	let listainscritos = servicioInscripcion.mostrar();		
	let listainscritoslarge = servicioInscripcion.mostrarinscritos();
	res.render('listarinscritos',{
		listainscritoslarge : listainscritoslarge,
		auth : req.session.auth
	});*/

		//listar inscripciones disponibles

					/*			InscripcionMongo.aggregate([
								//	{
								//		$unwind: "$usuarios"
								//	}, {
								//		$group: {
								//			"_id": '$usuarios'
								//		}
								//	}, 
										//level-2 :titles 
										{ $lookup: { 
											from: 'CursoMongo', 
											localField: 'curso', 
											foreignField: 'id', 
											as: 'cursosjoin' }    
										},
										
																					//level-3 : issues
										{ $lookup: { 
												from: 'UsuarioMongo', 
												localField: 'usuarios', 
												foreignField: 'id', 
												as: 'usuariosjoin'},
										},
										{
												$unwind: "$usuarios"
										},																													
										{"$project":
										{
											"curso": 1,
											"usuariosjoin": {
												"nombre": 1,
												"coreo": 1
												}
										}
										}										
										//,
										//{$group: {_id:'curso'}}//,
										//{
										//		$unwind: "$usuariosjoin"
										//},											
    									//{ $unwind:"$CursoMongo", preserveNullAndEmptyArrays: true }, 
										//{$project: {'_id':0, idcurso: "$cursos.id", nombrecurso: "$cursos.nombre"}}
										//{$project: {'_id':0, idcurso: 1, nombrecurso: 1}}

										//, 
										//{
										//	$unwind: '$cursos'
										//}//,
										//{
										//	
										//		$match: {
										//			  'cursos.estado': 'disponible'
										//		}
											  
										//}
										//,

								])
							.exec(function (err, results)
						{
								if (err) return res.status(500).send("There was a problem finding the Issues.");
								if (!results) return res.status(404).send("No Issues found.");
								return console.log (results)
								return console.log ('reg'+ registro)

								res.render ('listarinscritos',{
									listainscritoslarge : results,
									auth : req.session.auth	

							}) */
	

						
				//-----------

			   
	//			   });

	InscripcionMongo.find( {} ,(err,respuesta)=>{
		let rta = [];
		
			if(err){
				return console.log("errorrrrrrrrrr");
			}

			if(respuesta){

			let fil = {};
			respuesta.forEach(fila => {
			
				let cursoId = fila.curso;

				CursoMongo.findOne({$and: [{'id': cursoId},{'estado': 'disponible'}]},(err,curso)=>{
					let inscrito = [];
					if (err){
						return console.log(err)
					}
			
					if(curso){
						
							fila.usuarios.forEach( usuarioId => {
								
								UsuarioMongo.findOne({id: usuarioId}, (err, usuario) =>{

												if(err){
													return console.log("errorrrrrrrrrr");
												}

									console.log("rta =" + rta);
								
									if(usuario){
									inscrito.push(usuario);	
								      /*  fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
										console.log("--------"+inscrito);
										rta.push(fil);*/

									}else {

									}					
									
								}	
								

								);
							})

							fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
							console.log("--------"+inscrito);
							rta.push(fil);
							
					}

					/* fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
							console.log("--------"+inscrito);
							rta.push(fil);*/
				})
				
			})
				setTimeout(function() {   
					res.render ('listarinscritos',{
					listainscritoslarge : rta,
					auth : req.session.auth			
					})
				 },2000);		
			
			} // FIN IF RESPUESTA



			//
		
			
	}	
	);


			
			});
	



app.get('/desinscribiracurso', (req,res) => {
	verificarAcceso(req.session.auth, '/desinscribiracurso', res);
	let listacursos = servicioCursos.mostrardisponibles();	
	let listausuarios = servicioUsuario.mostrar();
    let listainscritoslarge = servicioInscripcion.mostrarinscritos();
    res.render('desinscribircurso',{
		listacursos : listacursos,
		listausuarios: listausuarios,
		listainscritoslarge : listainscritoslarge,
		auth : req.session.auth
	});
});


app.post('/desinscribiracurso', (req,res) => {
	verificarAcceso(req.session.auth, '/desinscribiracurso', res);
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
		auth : req.session.auth
		});	
	},4000)
		

});


app.get('/cerrarcurso', (req,res) => {	
	verificarAcceso(req.session.auth, '/cerrarcurso', res);

	//let curso = servicioCursos.cerrarcurso(req.query.id);
	//let listainscritoslarge = servicioInscripcion.mostrarinscritos();					
	//res.render('listarinscritos',{
	//	listainscritoslarge : listainscritoslarge,
	//	auth : auth
	//});


	CursoMongo.findOne({'id': req.query.id},(err,cursoacerrar)=>{
		if (err){
			return console.log(err)
		}

						UsuarioMongo.find({'rol': 'docente'},(err,respuestadocentes)=>{
							if (err){
								return console.log(err)
							}
								console.log(respuestadocentes)
								res.render ('cerrarcurso',{
									curso : cursoacerrar,
									listadocentes : respuestadocentes,
									auth : req.session.auth			
								})
						})			


	})


}); 

app.post('/cerrarcurso', (req,res) => {	
	verificarAcceso(req.session.auth, '/cerrarcurso', res);
	console.log('curso:'+req.body.nombrecurso)
	console.log('docente:'+req.body.nombredocente)
	let msg;

    CursoMongo.updateOne( { 'id' : parseInt(req.body.nombrecurso)}, { 'iddocente' : parseInt(req.body.nombredocente), 'estado' : 'cerrado' } , (err,respuestadocen)=>{
    	console.log('asignando docente')
    	if (err){
			return console.log(err)
		}else{
			console.log('respuestadocen:'+respuestadocen)
									msg = 'curso cerrado exitosamente!!, se asigno el docente' + req.body.nombredocente
		}

    });



	CursoMongo.findOne({'id': req.query.id},(err,cursoacerrar)=>{
		if (err){
			return console.log(err)
		}

						UsuarioMongo.find({'rol': 'docente'},(err,respuestadocentes)=>{
							if (err){
								return console.log(err)
							}
								console.log(respuestadocentes)
								res.render ('cerrarcurso',{
									curso : cursoacerrar,
									listadocentes : respuestadocentes,
									mensajeError : msg,
									auth : req.session.auth			
								})
						})			


	})


}); 


app.get('/eliminarinscripcion', (req,res) => {
	verificarAcceso(req.session.auth, '/eliminarinscripcion', res);

	let eliminarinscripcion = servicioInscripcion.eliminar();
	let curso = servicioInscripcion.eliminar(req.query.iduser,req.query.idcurso);
	let listainscritoslarge = servicioInscripcion.mostrarinscritos();	
    
    InscripcionMongo.updateOne( { 'curso' : req.query.idcurso}, { $pull: { 'usuarios' : req.query.iduser.toString() } }, (err,respuestapull)=>{
		if(err){
			return console.log(err)
		}else{
			//*********************
				InscripcionMongo.find( {} ,(err,respuesta)=>{
					let rta = [];
		
					if(err){
						return console.log("errorrrrrrrrrr");
					}

					if(respuesta){

						let fil = {};
						respuesta.forEach(fila => {
			
							let cursoId = fila.curso;

							CursoMongo.findOne({$and: [{'id': cursoId},{'estado': 'disponible'}]},(err,curso)=>{
								let inscrito = [];
								if (err){
									return console.log(err)
								}
				
								if(curso){
							
									fila.usuarios.forEach( usuarioId => {
									
										UsuarioMongo.findOne({id: usuarioId}, (err, usuario) =>{

											if(err){
												return console.log("errorrrrrrrrrr");
											}

											console.log("rta =" + rta);
									
											if(usuario){
											inscrito.push(usuario);	
									      /*  fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
											console.log("--------"+inscrito);
											rta.push(fil);*/

											}else {

											}					
										
										});
									})

									fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
									console.log("--------"+inscrito);
									rta.push(fil);
								
								}

								/* fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
								console.log("--------"+inscrito);
								rta.push(fil);*/
							})// fin CursoMongo.findOne
				
						})//---------
					setTimeout(function() {    	
						res.render ('listarinscritos',{
						listainscritoslarge : rta,
						auth : req.session.auth			
						})
					},2000);			
			
					} // FIN IF RESPUESTA
				});


			//*************			
			
			} 
		
		
	});

}); 

app.get('/listarmiscursos', (req,res) => {
	verificarAcceso(req.session.auth, '/listarmiscursos', res);

	let listaincripciones = [];
	let miscursoslist=[];
	let usuarioslist= [];

	InscripcionMongo.find({},(err,respuestainscripciones)=>{
		if(err){
			 console.log(err)
		}else{
			listaincripciones = respuestainscripciones;
			listaincripciones.forEach(function(element) {
	  			usuarioslist=element.usuarios;
	  			usuarioslist.forEach(function(usuariocurso){
	  				if(usuariocurso==req.session.auth.id){
						CursoMongo.findOne({'id': element.curso},(err,respuestacursos)=>{
							if(err){
								 console.log(err)
							}else{
								miscursoslist.push(respuestacursos);
							}
						});
	  				}
	  			});
			});
		
			setTimeout(function() {
				res.render('listarmiscursos',{
				listacursosusuario : miscursoslist,
				auth : req.session.auth
				});
			},2000);

		}
		
		

	});

});



app.get('/eliminarmicurso', (req,res) => {
	verificarAcceso(req.session.auth, '/eliminarmicurso', res);
	console.log('***  eliminarmicurso')
	console.log('***  curso:'+req.query.idcurso+' usuario:'+req.session.auth.id.toString())
	console.log('***  eliminarmicurso')

	let listaincripciones = [];
	let miscursoslist=[];
	let usuarioslist= [];
	// eliminado curso
	    InscripcionMongo.updateOne( { 'curso' : req.query.idcurso}, { $pull: { 'usuarios' : req.session.auth.id.toString() } }, (err,respuestapull)=>{
    	console.log('eliminando');
    	if(err){
			return console.log(err)
		}else{
			console.log('=============== respuestapull'+respuestapull);

			InscripcionMongo.find({},(err,respuestainscripciones)=>{
				if(err){
					return console.log(err)
				}else{
					listaincripciones = respuestainscripciones;
					listaincripciones.forEach(function(element) {
			  			usuarioslist=element.usuarios;
			  			usuarioslist.forEach(function(usuariocurso){
			  				if(usuariocurso==req.session.auth.id){
								CursoMongo.findOne({'id': element.curso},(err,respuestacursos)=>{
									if(err){
										return console.log(err)
									}else{
										miscursoslist.push(respuestacursos);
									}
								});
			  				}
			  			});
					});
				
					setTimeout(function() {
						res.render('listarmiscursos',{
						listacursosusuario : miscursoslist,
						auth : req.session.auth
						});
					},2000);

				}
			});
		}
    });
}); 

app.get('/test', (req,res) => {
	verificarAcceso(req.session.auth, '/test', res);
		res.render('test',{
		auth : req.session.auth
		});
	});

app.get('/listarcursosdocente', (req,res) => {
	verificarAcceso(req.session.auth, '/listarcursosdocente', res);	

		//*********************
		InscripcionMongo.find( {} ,(err,respuesta)=>{
			let rta = [];

			if(err){
				return console.log("errorrrrrrrrrr");
			}

			if(respuesta){

				let fil = {};
				respuesta.forEach(fila => {
	
					let cursoId = fila.curso;

					console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa ----------------------------->>>'+req.session.auth.id);
					let idDocente = req.session.auth.id;

					CursoMongo.findOne({$and: [{'id': cursoId},{'iddocente': idDocente},{'estado': 'cerrado'}]},(err,curso)=>{
						let inscrito = [];
						if (err){
							return console.log(err)
						}
		
						if(curso){
					
							fila.usuarios.forEach( usuarioId => {
							
								UsuarioMongo.findOne({id: usuarioId}, (err, usuario) =>{

									if(err){
										return console.log("errorrrrrrrrrr");
									}

									console.log("rta =" + rta);
							
									if(usuario){
									inscrito.push(usuario);	
							      /*  fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
									console.log("--------"+inscrito);
									rta.push(fil);*/

									}else {

									}					
								
								});
							})

							fil = {"curso" : curso.nombre, "idcurso" : curso.id, "inscrito" : inscrito};
							console.log("--------"+inscrito);
							rta.push(fil);
						
						}

					})// 
		
				});//---------
		
	
			} // FIN IF RESPUESTA

				setTimeout(function() {    	
				res.render ('listarinscritos',{
				listainscritoslarge : rta,
				auth : req.session.auth			
				})
			},2000);	
		});


	//*************			
			
}); 


app.get('*', (req,res) => {
	res.render('index', {
		auth: req.session.auth
	});
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