# Mean Completo

Ejemplo de aplicación full-stack con Mongo, Express, Angular y Node. En esta aplicación construiremos una aplicación que utiliza como backEnd Express ejecutado desde Node, como base de datos Node y como FrontEnd Angular.

# Dependencias
Por comodidad partimos creando una aplicación Angular utilizando el CLI de Angular
```
ng new mean-completo
```
Cuando pregunte le diremos que sí vamos a utilizar router y usaremos css plano. 
Más cosas que necesitaremos. Lo primero Mongo, en mi caso voy a utilizar un mongo que tengo instalado en docker, la instalación de mongo no se tratará en estos apuntes, pero es fácil encontrar documentación.
Otra cosa necesaria es evidentemente Express que instalaremos con npm.
```
npm i -s express
```
Otra cosa que se necesitaba antes de la versión 4.16 de express era body-parser, sin embargo a partir de esa versión ya no es necesario.
Para tratar con mongo desde express se necesita también la librería mongoose que también instalamos con npm
```
npm i -s mongoose
```
Aunque en producción se hará de otra maanera, en desarrollo el servidor de la base de datos y el servidor web no proceden de la misma fuente, son dos servidores distintos, esto en teoría está estrictamente prohibido por seguridad, sin embargo para desarrollo podemos saltarnoslo mediante la librería cors que también instalamos con npm
```
npm i cors
```
Por último para no tener que estar levantando a cada cambio de código al servidor web se suele utilizar nodemon que detecta los cambios y reinicia la aplicación para que refleje deichos cambios. Como es una utilidad de uso común se suele instalar globalmente.
```
npm i -g nodemon
```
# Levantando el Backend
## Servidor web
Empezamos configurando el servidor web con express. Tradicionalmente se crea una aplicación express (en un fichero app.js) y un servidor que la lanza y se queda a la escucha (en otro fichero server.js) para separar el backend del resto de la aplicación angular voy a crear todo lo necesario en una carpeta llamada backend
La configuración mínima que tienen  estos dos ficheros es:
- app.js
```javascript
const express=require('express');

const app=express();

module.exports=app;
```
- server.js
```javascript
'use strict';

const app = require('./app');

app.listen(
    4000, ()=>console.log('servidor funcionando')
)
```
> **Nota**: ```require('modulo')``` es la forma que tiene node de importar modulos ya que node es anteriro a que apareciera el import de javascript.
> 
si ahora hacemos:
```
node src\app\backend\server.js
```
obtenemos la respuesta
```
servidor funcionando y si en un navegador ponemos la dirección localhost:4000 en vez de darnos un error 404 nos contestará cannot /get, esto quiere decir que hay un servidor que contesta aunque no sepa que contestar porque todavía no lo hemos configurado.
```
Ya que tenemos nodemon instalado podemos hacer que se quede esperando a los cambios que se hagan en el código, además dentro de package.json podemos añadir una entrada en los scripts para que nos lo ejecute de forma directa sin tener que escribirlo cada vez en el terminal, en mi caso he llamado a esta entrada *'servidor'*. La sección de scripts quedará de la siguiente forma:
```json
  "scripts": {
    "ng": "ng",
    "start": "ng serve -o",
    "servidor": "nodemon src/app/backend/server.js", 
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
  ```
VS code nos mostrará una nueva entrada en la sección NPM SCRIPTS llamada servidor que podemos utilizar para poner en marcha el servidor
## Añadiendo rutas
Hasta ahora el servidor no nos contesta nada porque no sabe a donde ir, para que lo sepa debemos ponerle rutas o endpoints, es decir sitios a los que puede ir para dar alguna respuesta. Los endpoints en express se crean de la forma siguiente. si suponemos que app es nuestra aplicación express haremos:
```
app.METHOD(PATH, HANDLER)
```
Donde:
- app es una instancia de express
- METHOD  es un método HTTP (get, post, put, delete)
- PATH es la ruta a crear
- HANDLER es una función de callback

Para ver más sobre el direccionamiento básico de express se puede consultar https://expressjs.com/es/starter/basic-routing.html:
Para añidir rutas vamos a utilizar otro fichero al que llamaremos routes.js (por ejemplo) y como es posible que se necesiten varios de estos en función del tamaño de la aplicación lo pondremos en su propia carpeta /routes. Dentro voy a definir un par de rutas que nos devolverán cosas distintas
- routes.js
```javascript
const express = require('express');
const router = express.Router();

router.get('/',
    (req, res) => res.status(200).send('hola mundo!')
);

router.get('/hola',
    (req, res) => res.status(200).send('<h1>Hola otra vez</h1>')
    );

module.exports = router;  //exportamos el router
```
para que funcione tenemos que importar (require) el router en app.js y decirle que las utilice
```javascript
const express=require('express');
const routes=require('./routes/routes');

const app=express();

app.use('/',routes);

module.exports=app;
```
con esto todas las rutas que empiecen por '/' devolverán lo que indique la función de callback correspondiente. Vamos a complicar esto un poco.
Creemos otro fichero de rutas routes-patient.js que nos van a indicar que hacer con una supuesta aplicación de pacientes.
- routes-patient.js
```javascript
const express = require('express');   
const router = express.Router();  

router.get('/',
    (req, res) => res.status(200).send('traigo la lista de pacientes')
);

router.get('/new',
    (req, res) => res.status(200).send('creo un nuevo paciente')
    );

module.exports = router;  //exportamos el router
```
Podemos ver que tiene el mismo aspecto que el routes anterior, las rutas al raiz '/' nos devolverán supuestamente la lista de pacientes, mientras que las dirigidas a '/new' nos crearán un nuevo paciente. Esto también lo tenemos que mandar a app.js para que entienda las nuevas rutas.
- app.js
```javascript
const express=require('express');
const routes=require('./routes/routes');
const patientsRoutes=require('./routes/routes-patient')

const app=express();

app.use('/',routes);
app.use('/pacientes',patientsRoutes);

module.exports=app;
```
Como vemos la nueva línea app.use apunta a '/pacientes' ya que sino entraría en conflicto con las anteriores rutas. Así, ahora las rutas son:
- '/'   que devuelve *hola mundo!*
- '/hola'   que devuelve ```<h1>Hola otra vez</h1>```
- '/pacientes'  que devuelvería la lista de pacientes
- '/pacientes/new'  que crearía un nuevo paciente