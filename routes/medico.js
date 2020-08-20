//Requires
var express = require('express');

var mdMiddlewares = require('../middlewares/autenticacion');

//var SEED = require('../config/config').SEED;

var app = express();

var Medico = require('../models/medico');

// ============================================
// Obtener todos los medicos
// ============================================

app.get('/', (req, res, next) => {

	var desde = req.query.desde || 0;
	desde = Number(desde);

	Medico.find({})
		   .skip(desde)
		   .limit(5)
		   .populate('usuario', 'nombre email')
		   .populate('hospital')
		   .exec(
		   		(err, medicos) =>{
					if (err) {
						return res.status(500).json({
							ok:false,
							mensaje: 'Error cargando medico',
							errors: err
						});
					}

					Medico.count({}, (err, conteo) => {
						res.status(200).json({
							ok:true,
							medicos: medicos,
							total: conteo
						});
					});

				});
});

// ==========================================
// Obtener médico por Id
// ==========================================
app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });

        })


});


// ============================================
// Actualizar medico
// ============================================


app.put('/:id', mdMiddlewares.verificaToken, (req, res) => {

	var id = req.params.id;
	var body = req.body;

	Medico.findById(id, (err, medico) => {

		if (err) {
			return res.status(500).json({
				ok:false,
				mensaje: 'Error al buscar medico',
				errors: err
			});
		}

		if (!medico) {
			return res.status(400).json({
				ok:false,
				mensaje: 'El medico con el ' + id + 'no existe',
				errors: { message: 'No existe un medico con ese ID'}
			});
		}

		medico.nombre = body.nombre;		
		medico.usuario = req.usuario._id;
		medico.hospital = body.hospital

		medico.save( (err, medicoGuardado) => {

			if (err) {
				return res.status(400).json({
					ok:false,
					mensaje: 'Error al actualizar medico',
					errors: err
				});
			}

			res.status(200).json({
				ok:true,
				medico: medicoGuardado
			});

		});

	});

});



// ============================================
// Crear un nuevo medico
// ============================================

app.post('/', mdMiddlewares.verificaToken, (req, res) => {

	var body = req.body;

	var medico = new Medico({
		nombre: body.nombre,
		usuario: req.usuario._id,
		hospital: body.hospital
	});

	medico.save((err, medicoGuardado) => {
		if (err) {
			return res.status(400).json({
				ok:false,
				mensaje: 'Error al crear un medico',
				errors: err
			});
		}

		res.status(201).json({
			ok:true,
			medico: medicoGuardado			
		});
	});

});


// ============================================
// Borrar un medico por id
// ============================================

app.delete('/:id', mdMiddlewares.verificaToken, (req, res) => {

	var id = req.params.id;

	Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

		if (err) {
			return res.status(500).json({
				ok:false,
				mensaje: 'Error al borrar medico',
				errors: err
			});
		}

		if (!medicoBorrado) {
			return res.status(400).json({
				ok:false,
				mensaje: 'No existe un medico con ese ID',
				errors: { message: 'No existe un medico con ese ID'}
			});
		}

		res.status(200).json({
			ok:true,
			medico: medicoBorrado
		});
	});

});

module.exports = app;
