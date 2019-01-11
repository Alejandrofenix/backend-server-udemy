var express = require('express');
var app = express();

var mdAutenthication = require('../middleware/authentication');
var Medico = require('../models/medico');


// ==========================================
// Obtener todos los Medicos
// =========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });

            }

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });

            });

        });


});


// ==========================================
// Actualizar Medicos
// =========================================

app.put('/:id', mdAutenthication.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {

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
                mensaje: 'El medico con el ID ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });

            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });





});
// ==========================================
// Crear un nuevo Medico
// =========================================
app.post('/', mdAutenthication.verificaToken, (req, res) => {

    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital

    });

    medico.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Medico',
                errors: err
            });

        }

        res.status(201).json({
            ok: true,
            Medico: hospitalGuardado
        });


    });

});

// ==========================================
//  Borrar un Medico por el ID
// =========================================
app.delete('/:id', mdAutenthication.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar Medico',
                errors: err
            });

        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un Medico con ese ID',
                errors: { mensaje: 'No existe ningun Medico con ese ID' }
            });

        }

        res.status(200).json({
            ok: true,
            Medico: hospitalBorrado
        });
    });
});
module.exports = app;