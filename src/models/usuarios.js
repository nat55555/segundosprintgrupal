const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const usuarioSchema = new Schema({
	id : {
		type : Number,
		required : true	,
		trim : true,
		unique: true  // valida que el id no exista antes
	},
	nombre :{
		type : String,
		required : true
	},
	correo : {
		type: String,
		required : true	
	},
	telefono : {
		type: String,
		required : true				
	},
	clave : {
		type: String,
		required : true				
	},	
	rol : {
		type: String,
		required : true					
	}
});

usuarioSchema.plugin(uniqueValidator, { message: 'Error, ya existe un {PATH} con ese valor' });


const Usuario = mongoose.model('Usuario', usuarioSchema);


module.exports = Usuario