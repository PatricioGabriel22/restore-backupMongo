import mongoose from 'mongoose'


export async function connectDB() {
    await mongoose.connect('mongodb+srv://ppuchetadev:6awQJNg5WD5GD6vq@cluster0.7yzio5l.mongodb.net/restoreTool')
    
        while (mongoose.connection.readyState !== 1) {
            console.log("⌛ Esperando conexión a MongoDB...");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar 500ms antes de verificar otra vez
        }
    
    console.log("Conectado a mongoDB")
    
}