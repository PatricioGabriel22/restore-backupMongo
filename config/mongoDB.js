import mongoose from 'mongoose'
import { uriClusteForStoreBackupData } from '../dataDBS';

export async function connectRestoreScriptCluster() {
    
    await mongoose.connect(uriClusteForStoreBackupData)
    
        while (mongoose.connection.readyState !== 1) {
            console.log("⌛ Esperando conexión a MongoDB...");
            await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar 500ms antes de verificar otra vez
        }
    
    return true
    
}