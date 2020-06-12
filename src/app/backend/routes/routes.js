const express = require('express');   //nos taremos express
const router = express.Router();  // instancio express en router

// al invocar la ruta '/' devuelve 'hola mundo!'
router.get('/',
    (req, res) => res.status(200).send('hola mundo!')
);

router.get('/hola',
    (req, res) => res.status(200).send('<h1>Hola otra vez</h1>')
    );

module.exports = router;  //exportamos el router