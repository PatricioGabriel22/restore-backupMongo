import mongoose from 'mongoose'


export const ArchivoSchema = new mongoose.Schema({
    nombre: String,
    fecha:String,
    archivos: [mongoose.Schema.Types.Mixed] // Permite almacenar JSON o BSON
  });
  
