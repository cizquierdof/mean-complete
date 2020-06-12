const express = require('express');   
const router = express.Router();  

router.get('/',
    (req, res) => res.status(200).send('traigo la lista de pacientes')
);

router.get('/new',
    (req, res) => res.status(200).send('creo un nuevo paciente')
    );

module.exports = router;  //exportamos el router