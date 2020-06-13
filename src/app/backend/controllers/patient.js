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