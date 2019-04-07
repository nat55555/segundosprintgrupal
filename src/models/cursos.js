const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;
const cursoSchema = new Schema({
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
	descripcion : {
		type: String,
		required : true	
	},
	valor : {
		type: String,
		required : true				
	},
	modalidad : {
		type: String,
		required : true				
	},
	intensidad : {
		type: String,
		required : true				
	},		
	estado : {
		type: String,
		required : true					
	}
});

cursoSchema.plugin(uniqueValidator, { message: 'Error, ya existe un {PATH} con ese valor' });

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso