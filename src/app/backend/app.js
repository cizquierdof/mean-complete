const express=require('express');
const routes=require('./routes/routes');
const patientsRoutes=require('./routes/routes-patient')
const cors =require('cors');
const { json } = require('express');
const app=express();

//app.use(cors());
app.use(json());


app.use('/',routes);
app.use('/pacientes',patientsRoutes);

module.exports=app;