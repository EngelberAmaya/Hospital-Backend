//Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');

// ==========================================
//  Renovar Token
// ==========================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4 horas

    res.status(200).json({
        ok: true,
        //usuario: req.usuario,
        token: token
    });

});

app.post('/', (req, res) =>{

	var body = req.body;

	Usuario.findOne({email: body.email}, (err, usuarioDB) => {

		if (err) {
			return res.status(500).json({
				ok:false,
				mensaje: 'Error al buscar usuario',
				errors: err
			});
		}

		if (!usuarioDB) {
			return res.status(400).json({
				ok:false,
				mensaje: 'Credenciales incorrectas',
				errors: err
			});
		}

		if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
			return res.status(400).json({
				ok:false,
				mensaje: 'Credenciales incorrectas',
				errors: err
			});
		}

		// Crear un token
		usuarioDB.password = ':)';
		var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400}); // 4 horas


		res.status(200).json({
			ok:true,
			usuario: usuarioDB,			
			token: token,
			id: usuarioDB._id,
			menu: obtenerMenu(usuarioDB.role)
		});

	});

});


function obtenerMenu(ROLE) {

     var menu = [
     {
       titulo: 'Principal',
       icono: 'mdi mdi-gauge',
       submenu: [
         //{ titulo: 'Main', url: '/' },
         { titulo: 'Dashboard', url: '/dashboard' },
         { titulo: 'Gráficas', url: '/grafica1' },
         { titulo: 'RxJs', url: '/rxjs' },
         { titulo: 'Promesas', url: 'promesas' },
         { titulo: 'ProgressBar', url: '/progress' },
       ]
     },

     {
       titulo: 'Mantenimientos',
       icono: 'mdi mdi-folder-lock-open',
       submenu: [
         //{ titulo: 'Usuarios', url: '/usuarios' },
         { titulo: 'Hospitales', url: '/hospitales' },
         { titulo: 'Médicos', url: '/medicos' },
       ]
     },
   ];

    console.log('ROLE', ROLE);

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }


    return menu;

}

module.exports = app;