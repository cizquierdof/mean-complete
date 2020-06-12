const express=require('express');
const routes=require('./routes/routes');
const patientsRoutes=require('./routes/routes-patient')

const app=express();

app.use('/',routes);
app.use('/pacientes',patientsRoutes);

module.exports=app;