import mongoose from 'mongoose'


export async function connectRestoreScriptCluster() {
    const uriClusteForStoreBackupData = 'mongodb+srv://ppuchetadev:6awQJNg5WD5GD6vq@cluster0.7yzio5l.mongodb.net/restoreTool'
    await mongoose.connect(uriClusteForStoreBackupData)
    
        while (mongoose.connection.readyState !== 1) {
            console.log("⌛ Esperando conexión a MongoDB...");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar 500ms antes de verificar otra vez
        }
    
    return true
    
}