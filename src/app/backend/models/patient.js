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