import mongoose from 'mongoose'


const ArchivoSchema = new mongoose.Schema({
    nombre: String,
    archivos: [mongoose.Schema.Types.Mixed] // Permite almacenar JSON o BSON
  });
  
export const ArchivoModel = mongoose.model("Archivo", ArchivoSchema);