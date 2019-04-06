const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const inscripcionSchema = new Schema({
	curso : {
		type : Number,
		required : true	,
		trim : true,
		unique: true  // valida que no haya un registro para ese curso
	},
	usuarios :{
		type : Array,
		required : true
	}
});

inscripcionSchema.plugin(uniqueValidator, { message: 'Error, ya existe un registro de inscripciones para el curso con ese id {PATH} ' });

const Inscripcion = mongoose.model('Inscripcion', inscripcionSchema);

module.exports = Inscripcion