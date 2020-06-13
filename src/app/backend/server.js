'use strict';
const app = require('./app');
//importando mongoose
const db = require('mongoose');

//conectando a mongo local en port 27017
db.connect('mongodb://localhost:27017/hospital').then(
    //servidor web a la escucha
    app.listen(
        4000, () => console.log('Server up and running')
    )
).catch(
    err => console.log('Error de conexión', err)
)

