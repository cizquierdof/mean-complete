# Mean Completo

Ejemplo de aplicación full-stack con Mongo, Express, Angular y Node. En este tutorial construiremos una aplicación que utiliza como servidor, Express ejecutado desde Node, como base de datos, Node y como FrontEnd Angular.


## El Backend

El supuesto es que hacemos una aplicación que maneja datos de pacientes de un hospital. Para no complicarnos demasiado, en esta base de datos vamos a guardar solo el nombre, apellidos y un array de patologías que sufre el paciente. Representado esto como un json sería:

```json
{
    "name": "John",
    "surname": "Smith",
    "pathologies": [
        "Cefalea",
        "Meningitis",
        "Diabetes"
    ]

}
```

### Dependencias

Por comodidad partimos creando una aplicación Angular utilizando el CLI de Angular ya que esto nos descarga los node modules, inicializa el git y crea un package.json, a la aplicación la voy a llamar *mean-completo*, ¡sí, no soy muy original!.

```shell
ng new mean-completo
```

Cuando pregunte le diremos que sí vamos a utilizar router y usaremos css plano.

Más cosas que necesitaremos.

Lo primero es Mongo, en mi caso voy a utilizar un mongo que tengo instalado en docker. La instalación de mongo no es parte de estos apuntes y mucho menos el uso de docker, pero es fácil encontrar documentación. Sin embargo para efectos de esta aplicación, la elección de mongo en docker es extremadamente sencilla. Solo necesitamos instalar docker y el pluguin de docker para visual studio code. una vez instalado docker, lo ponemos en marcha y después desde consola hacemos:

```shell
docker pull mongo
docker run -d -p 27017-27019:27017-27019 --name mongodb mongo
```

Ya está con esto hemos creado una instancia de mongo llamada mongodb que se está ejecutando en background en el puerto **27017**. Si queremos ver el contenido y manejarlo un poco, podemos descargar [Robo3T](https://robomongo.org/) que es un GUI para mongo al estilo de Workbench para MySQL aunque algo más básico.

Otra cosa necesaria es, evidentemente Express que instalaremos con npm.

```shell
npm i -s express
```

Otra cosa que se necesitaba antes de la versión 4.16 de express era body-parser, sin embargo a partir de esa versión ya no es necesario.

Para tratar con mongo desde express se necesita también la librería mongoose que también instalamos con npm

```shell
npm i -s mongoose
```

Aunque en producción se hará de otra manera, en desarrollo, el servidor de la base de datos y el servidor web no proceden de la misma fuente, es decir responden desde direcciones o pùertos diferentes; esto en teoría está estrictamente prohibido por seguridad, sin embargo para desarrollo podemos saltarnoslo mediante la librería *cors* que también instalamos con npm.

```shell
npm i cors
```

Por último para no tener que estar levantando a cada cambio de código al servidor web se suele utilizar nodemon que detecta los cambios y reinicia la aplicación para que refleje dichos cambios. Como es una utilidad que se usa muy frecuentemente en toda clase de proyectos, lo normal y recomendable es instalarla globalmente.

```shell
npm i -g nodemon
```

### Levantando el Backend

#### Servidor web

Empezamos configurando el servidor web con express. Tradicionalmente se crea una aplicación express en un fichero (app.js) y un servidor que la lanza y se queda a la escucha en otro fichero (server.js), los nombres no son obligatorios pero es costumbre llamarlos así.

Voy separar el backend del resto de la aplicación angular poniendo todo lo necesario para este en una carpeta llamada backend.

La configuración mínima que tienen estos dos ficheros de los que hablabamos es:

- app.js

```javascript
//nos taremos express
const express=require('express');
//app va a ser nuestra aplicación express que exportaremos
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

> **Nota**: ```require('modulo')``` es la forma que tiene node de importar modulos ya que node es anteriro a que apareciera el import de javascript. De la misma forma para exportar se hace con ```module.exports = module_name```

si ahora hacemos:

```shell
node src\app\backend\server.js
```

obtenemos la respuesta

```shell
servidor funcionando
```

 y si en un navegador ponemos la dirección localhost:4000 en vez de darnos un error 404 nos contestará *cannot /get*, esto quiere decir que hay un servidor que contesta aunque no sepa que contestar porque todavía no lo hemos configurado.

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

VS code nos mostrará una nueva entrada en la sección NPM SCRIPTS llamada servidor que podemos utilizar para poner en marcha el servidor. Atento a la ruta si no lo has puesto en el mismo sitio que yo.

#### Añadiendo rutas

Hasta ahora el servidor no nos contesta nada porque no sabe a donde ir, para que lo sepa debemos ponerle rutas o endpoints, es decir sitios a los que puede ir para dar alguna respuesta. Los endpoints en express se crean de la forma siguiente. si suponemos que app es nuestra aplicación express haremos:

```shell
app.METHOD(PATH, HANDLER)
```

Donde:

- app es una instancia de express
- METHOD  es un método HTTP (get, post, put, delete)
- PATH es la ruta a crear
- HANDLER es una función de callback

Para ver más sobre el direccionamiento básico de express se puede consultar <https://expressjs.com/es/starter/basic-routing.html.>

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

Compruébalo:

- Pon en marcha el servidor con el script que creamos hace un rato
- Prueba cualquiera de las rutas anteriores y verifica que responde correctamente.

#### Conectando mongo

Nos aseguramos de que tenemos mongo corriendo, en mi caso estaba en un docker, así que me aseguro de que se está ejecutando tanto docker commo el contenedor de mongo. Después añadimos mongo a server.js. Para conectar con mongo desde javascript usamos la librería mongoose que debemos importar a server.js con require. despues instanciamos un objeto mongoose y conectamos con la base de datos mediante el método connect de mongoose, este devuelve una promesa que podemos utilizar para arrancar el servidor web cuando tengamos respuesta positiva. Con todo esto el código de **server.js** queda:

- server.js

```javascript
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
```

Podemos ver que para conectar con mongo es una cadena de conexion. Recordemnos que la instancia docker de mongo la habiamos llamado *mongodb* y que estaba en el puerto 27107, así que para conectar necesitamos la cadena ```'mongodb://localhost:27017/hospital'```. después si no hay ningún problema la respuesta de la promesa pondrá a la instancia app de express a la escucha en el puerto 4000 apuntando a un esquema o base de datos llamado hospital. En principio podemos tener creado o no el esquema hospital. Si ya está creado lo utilizará, si no, en cuanto creemos el primer documento, creaará también el esquema, así que de momento n9o tenemos que hacer nada en absoluto. Simplemente tenemos a nuestra aplicación esperando acontecimientos desde el puerto 4000.
Con esto ya tenemos las bases para el backend de la aplicación.

#### Model, endpoint y controller

Si queremos manejar datos, lo primero que debemos tener es un modelo de datos. Como se dijo al principio nuestros datos son pacientes y sus patologías, así que creamos una carpeta */models* y en ella un archivo patient.js donde definimos la estructura de datos. Cuidado, esto es una estructura de datos de mongo, así que lo que tenemos que crear no es un objeto javascript plano, sino un schema mongoose. En realida son muy parecidos pero mongoose requiere que se haga así. nuestro modelo de datos queda:

- patient.js

```javascript
//importamos mongoose
const mongoose=require('mongoose');
//definimos un esquema mongoose
const patientSchema = mongoose.Schema(
    {
        name: String,
        surname: String,
        pathologies: [String]
    }
)
// y lo exportamos, observa que la exportación es algo diferente de lo normal
module.exports = mongoose.model("Patient", patientSchema);
```

El siguiente paso es añadir un endpoint (ruta) que nos lleve a un controller que haga cosas con nuestros datos. En el apartado anterior sobre rutas ya nos habíamos adelantado a esto y ya hemos creado un par de rutas para manejar datos de pacientes. de momento estas rutas solo nos devuelven un texto, para que hagan algo más debemos hacer un controller en el que definiremos las funciones que se realizarán en cada ruta o endpoint.

Manos a la obra, dentro de una carpeta nueva */controllers* creamos el controller de pacientes al que voy a llamar patient.js. Dentro importamos el modelo de datos *patient.js* y creamos un objeto javascript que contiene los métodos que necesitemos, esto se hace así para poder exportar todos los métodos del controlador a la vez. En el ejemplo siguiente se definen tres métodos, uno que nos trae todos los pacientes de la base de datos, otro para crear un paciente nuevo y otro para obtener un solo paciente. El código correspondiente es:

- /controller/patient.js

```javascript
// taremos el modelo de datos
const Patient = require('../models/patient');
// objeto de controlador
const patientController = {
    //obtiene todos los pacientes
    getPatients: (req, res) => {
        Patient.find(
            (err, patients) => {
                return err ? res.status(500).send(err) : res.status(200).jsonp(patients)
            }
        )
    },
    //crea un nuevo paciente
    createPatient: (req, res) => {
        const {body}=req;
        console.log(body);
        const patient = new Patient();
        patient.name = body.name;
        patient.surname = body.surname;
        patient.pathologies = body.pathologies
        patient.save(
            (err, newPatient) =>
                err ?
                    res.status(500).send("Error guardando : " + err.message) :
                    res.status(201).jsonp(newPatient)
        );
    },
    //obtiene un paciente mediante su id
    getPatient: (req, res) => {
        Patient.findById(req.params.id, (err, patient) =>
            err ? res.status(500).send("error") : res.status(200).jsonp(patient)
        )
    },
    updatePatient: (req, res) => {
        const {body, params}= req;
          Patient.findById(params.id, (err, patient) => {
            if (err) {
              return res.status(404).send("Not found");
            }
            patient.name= body.name;
            patient.surname= body.surname;
            patient.pathologies= body.pathologies;
            patient.save()
            return res.status(200).jsonp(patient)
          })
      },
      deletePatient: (req, res) => {
        const {id} = req.params;
        Patient.findById(id, (err, patient) => {
          if (err) {
            return res.status(500);
          }
          if (!patient) {
            return res.status(404).send("not found")
          }
          patient.remove();
          return res.status(200).jsonp(patient);
        })
      }
}

module.exports = patientController
```

 No voy a adentrarme en el funcionamiento de mongo, para eso ya hay un montón de manuales y tutoriales en internet. Lo que si me interesa comentar es que mongo es una base de datos documental, o dicho llanamente, almacena documentos. Estos documentos en última instancia son objetos json que pueden tener toda la complejidad que se quiera peor a fin de cuentas son json. Dicho en forma simplista, mongo en sus bases de datos almacena colecciones, que harían, dicho sea con muchas reservas, las funciones de una tabla de una base de datos clásica. Y dentro de las colecciones se guardan los mencionados documentos. Esto es repito, de forma muy simplificada como funcionamongo. Para este ejercicio ya he comentadoo que utilizaré una base de datos que llamo *hospital* y que ya hemos visto que conectabamos en server.js y que en principio no es necesario que esté creada previamente.

 Como podemos ver en el código del controller, lo primero que hacemos es traernos el modelo de datos y lo guardamos en *Patient*, recordemos que el modelo de datos era un esquema mongo y esto forma parte de la magia de todo esto ya que solo por esto ya sabe que la colección con la que tiene que tratar es **patients**, es decir que mongoose el solito transforma el nombre del esquema de datos que le demos en una colección poniendo el nombre en minúsculas y añadiendo una 's' al final, así que ojo con los nombres que le ponemos porque el resultado puede tener sentido o no, aunque en realidad el nombre que le de a la collección no tiene mayor importancia que lo raro que nos pueda resultar un nombre mal elegido. En cualquier caso mongoose nos permitedefinir explícitamente el nombre de la colección.

 Bueno, ya sabemos que todo se hace a través de este objeto 'Patient' que hemos creado y que es un esquema mongoose, pero ¿como se hacen las operaciones? Pues a traves del propio 'Patient'. Este objeto además de conocer el modelo de datos, incorpora todos los métodos que se necesitan para consultar, guardar, editar y borrar documentos de mongo dentro de la colección correspondiente. Si continuamos con el código del controller vemos que despues de importar el esquema *Patient* definimos lo que es el controller en realidad, que no es más que un json de métodos, algo así:

 ```js
 const miController= {
     metodo1: (req,res)=>{código...},
     metodo2: (req, res)=>{código...},
     ....
 }

 ```

 Por ejemplo, la primera función que se ha creado en el controlador ```getPatients```, invoca al método *find* que recupera todos los documentos de la colección 'patients'. Este es el caso más sencillo. El método envía dos parámetros 'req' y 'res', el primero es el objeto que se pasa al método y que podemos utilizar para pasar toda clase de parámetros, el segundo 'res' es donde se devolverá la respuesta. En el código que tenemos actualmente al hacer ```Patient.find``` se ejecuta una función de callback que devuelve la lista de pacientes (patients) si todo va bien, o un error (err) si hay algún problema. La respuesta de callback es un operador ternario que nos manda un status 500 y el error en caso de que exista 'err' o en caso contrario, nos devuelve un status 200 y, muy importante, la lista de pacientes en formato json (```.jsonp(patients)```).

 en este método podríamos haber utilizado 'req' para pasar un filtro de lo que queremos buscar, ya que una de las cosas que incluye req es el body de la petición le podríamos haber pasado un json para que filtrara por el nombre, por ejemplo, Es decir si en el body de la petición GET le pasamos:

 ```json
 {
     "name":"John"
 }
 ```

 podemos utilizar 'req' para que filtre el resultado de la siguiente forma:

 ```js
     getPatients: (req, res) => {
      console.log(req.body.name);
        Patient.find({name:req.body.name},
            (err, patients) => {
                return err ? res.status(500).send(err) : res.status(200).jsonp(patients)
            }
        )
    },
```

Fijate en que el parámetro que le pasamos a 'find' es un json ```{name: req.body.name}```. Con el body anterior, la petición GET nos devolvería todos los documentos que tuvieran como nombre 'John'.

Esta es la mecánica para todos los métodos del controller, para crear un nuevo documento le pasamos como parámetro un patient que creamos con lo que le mandamos en el body de la petición POST, para ver un solo paciente lo hacemos con 'findById' que también pertenece a mongoose; el 'id' se lo pasamos mediante la url y lo recuperamos con req.param.idy de forma similar hacemos para borrar un documento de 'patients' pero con 'remove()' evidentemente con el correspondiente control de errores.

Para profundizar con todo esto se puede consultar la documentación de [mongoose](https://mongoosejs.com/docs/guide.html)

Qhe viene ahora. Si hacemos memoria recordaremos que en */routes/routes-patient.js* solo teniamos definidas rutas para los dos primeros así que hay que crear una nueva para el resto de métodos. Por otra parte también hay que modificar las otras dos rutas para que hagan más cosas y no solo devolver un mensaje de texto. Para ello debemos importar el controlador y poner en cada ruta el método correspondiente como función de callback, además vamos a traernos los métodos del controller como módulos y no el objeto entero, funciona exáctamente igual, pero queda más elegante:

- /routes/routes-patient.js

```javascript
// traemos los métodos del controller uno a uno
const { createPatient, getPatients, getPatient,
   updatePatient, deletePatient} = require('../controllers/patient')
const {Router} = require("express")

const router = Router();
// en vez de definir las rutas una a una las podemos ir encadenado
router
  .post("/", createPatient)
  .get("/", getPatients)
  .get("/:id", getPatient)
  .put("/:id", updatePatient)
  .delete("/:id", deletePatient)

module.exports = router;
```

Observa como la ruta para crear un nuevo paciente a pasado a ser del tipo post ya que lo que queremos es que se guarden datos en la base de datos, de paso podemos ahorrarnos añadir '/new' y dejarlo solo en '/' no hay posibilidad de que se confunda con el endpoint de recuperar todos los pacientes ya que se diferencia suficientemente al ser una post y otra get.

Vamos a comprobar que todo esto funciona. Para ello vamos a utilizar la herramienta postman. Postman sirve para mandar a direcciones específicas peticiones HTTP. Normalmente con un navegador podemos hacer peticiones get pero el resto no se pueden de forma directa, asi que esta herramienta es muy útil. Para descargarla ir a <https://www.postman.com/downloads/.> más tarde cuando ya tengamos nuestros componentes de angular ya podremos enviar y recibir por procedimientos normales pero de moemnto con esto podemos hacer todas las pruebas de backend necesarias.

Pero antes de hacer pruebas falta un paso muy importante. Mongo trabaja con objetos json así que le tenemos que decir a express que trabaje con json también. Para esto después de declarar app como aplicación express le diremso que utilice json. Es solo añadir la línea ```app.use(json())``` que queda así:

- app.js

```javascript
const express=require('express');
const patientsRoutes=require('./routes/routes-patient')
const { json } = require('express');
const app=express();

app.use(json());

app.use('/pacientes',patientsRoutes);

module.exports=app;
```

En esta versión he eliminado /routes/routes.js y sus rutas porque ya solo eran para explicar el tema de las rutas y ya no nos hacen falta.

Respecto a esto, hay que decir que el uso de un archivo de rutas como './routes/rotes-patient' no es estrictamente necesario, se podrían indicar directamente en la aplicación y ahorranos eel archivo y la llamada. El hecho de utilizarlo es simplemente una cuestión de orden; cuando solo tenemos unas pocas rutas no pasa nada, pero en una aplicación del mundo real el número de rutas puede ser muy grande y es mejor tenerlo todo ordenado y en su sitio. Todo es cuestión de buenas prácticas.

Y ahora sí que sí, vamos a comprobar que toda esta movida funciona. Abrimos postman  y le haces un post a ```localhost:4000/pacientes/``` poniendole en el body un json con los datos que quieres guardar en la base de datos; como por ejemplo lo siguiente:

```json
{
    "name": "Charles",
    "surname": "Manson",
    "pathologies": [
        "Psychopathy",
        "Bipolar disorder",
        "Antisocial disorder"
    ]
}
```

Si todo a ido bien, veremos que nos devuelve el mismo objeto con status 201, es decir que lo ha creado con éxito. Podemos comprobar que no ha hecho falta crear la base de datos ni la colección previamente, mongoose ya se ha encargado de todo. Ahora puedes seguir jugando y metaer unos cuantos documentos más cambiando el body por otros datos a tu gusto.

Vamos a comprobar que efectivamente tenemos el documento guardado. Si hacemos un get a ```localhost:4000/pacientes``` veremos que nos trae todos los documentos que se han creado. También podemos comprobar que mongo le ha añadido un id del tipo UUID (Universal Unique identifier), nosotros en ningún momento le hemos indicado que el documento lo tenga, eso lo hace mongo por si mismo, aunque siempre tenemos la posibilidad de forzarlo a lo que nosotros queramos, pero eso ya es un tema que afecta a como se utiliza mongo y este tutorial no es para eso, unos párrafos más atrás tienes el link a la documentación de mongoose.

por último podemos probar con todos los endpoints que nos hemos creado y ver que hacen lo que tienen que hacer y eso es todo ya tienes funcionando un backend javascript con mongo, node y express.

#### conclusiones Backend

Respecto al backend, esto es todo lo que hay que hacer. Podemos complicarlo todo lo que queramos, añadir más modelos de datos, controladores más complejos, más endpoints etc., pero todo esto no difieren para nada de lo que ya hemos visto, solo es más azucar al pastel. Y, si lo piensas, todo lo que hemos visto es un backend en javascript puro y duro, y aunque en el siguiente paso lo aplicaremos con componentes Angular, en realidad aun no hemos hecho nada que impida que lo utilices con cualquier otro Frontend, en este momento podríamos utilizar thimeleaf, react, más javascript con html puro, lo que sea.

### Frontend Angular

El siguiente paso es como presentar, crear, actualizar y borrar datos desde componentes y formularios de Angular...
