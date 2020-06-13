const { createPatient, getPatients, getPatient,
    updatePatient, deletePatient} = require('../controllers/patient')
 const {Router} = require("express")
 
 const router = Router();
 
 router
   .post("/", createPatient)
   .get("/", getPatients)
   .get("/:id", getPatient)
   .put("/:id", updatePatient)
   .delete("/:id", deletePatient)
   //.get("/:id/fallecido")
   //.patch()
 
 module.exports = router;