import { restoreOrBackupMongo,readFilesAndUploadDB } from "./main.js";
import fs from 'fs'
import { connectDB } from "./config/mongoDB.js";
import { ArchivoSchema} from './config/schema.js'
import mongoose from "mongoose";

import path from "path";


const url1 = "mongodb+srv://ppuchetadev:aGpFTFsPDFAwxqwJ@victorinacluster.ycryc.mongodb.net/"
const pass = 'aGpFTFsPDFAwxqwJ'


const url2 = "mongodb+srv://ppuchetadev:O1i1jMe1IndUGWM3@clustertestconection.secyw.mongodb.net/"
const pass2 = "O1i1jMe1IndUGWM3"


try {

    //---------------------guardar archivos en DB--------------------
    
    ///Backup 31-1-2025/dump/daysapp
    
    
    
    
    
    // const data = []
    // archivos.map(async (archivo)=>{
    //     data.push(fs.readFileSync(`backups/Backup 31-1-2025/dump/daysapp/${archivo}`))
    // })
    // await ArchivoModel.create({nombre: "archivo", archivos:data})

    //-------------para recuperar a partir de base64----------------
    

    async function restoreBase64Data(){
        // mongoose.connection.readyState === 0 ? await connectDB() : ''

        let allDBcollections = []
        
        console.log(mongoose.connection.readyState)
    
    
    
        const db =  mongoose.connection.db
        const collections =  await db.listCollections().toArray() //aca consigo la lista de colecciones
        
        // console.log(collections[0])
        
        for(const collection of collections){
            let aux
            
            const collectionName = collection.name //nombre de las colecciones
            const collectionTarget =  mongoose.connection.collection(collectionName)//aca me conecto con ellas
           
            aux = await collectionTarget.find().toArray() //aca me traigo un objeto con todo el contenido de las colecciones
    
            
            allDBcollections.push(...aux)
    
            
        }
            
             
        //a estas colecciones les tengo qe transformar sus arhcivos de Base64 nuevamente aarchovos como tal con un buffer
    
        console.log(allDBcollections)   
    
        const backupPath = 'Base64RestoredFiles'
    
        if(!fs.existsSync(backupPath)) fs.mkdirSync(backupPath)
    
        allDBcollections.forEach((collection)=>{
            //---Usar en caso de querer hacer subcarpetas----//
    
            const rutaDirCollection = path.join(backupPath,collection.nombre,collection.fecha,"dump",collection.nombre)
            fs.mkdirSync(rutaDirCollection,{recursive:true}) //aca se crea la subcarpeta
            
          
            collection.archivos.map((archivo,index)=>{
                if(index%2 === 0){

                    const buffer = archivo.buffer //crea un buffer para cada elemento de Base64
                    console.log(buffer)
                    const fileName = `${collection.nombre}-${index+1}.bson`
                    
                    
                    fs.writeFileSync(`${rutaDirCollection}/${fileName}`,buffer)
                }
                
            })
        })
    }

    await connectDB()
    //  await restoreOrBackupMongo('backup',url1,'daysapp')
    await restoreOrBackupMongo('backup',url2,'VeterinariaGatitas')

    await readFilesAndUploadDB()
    
    await restoreBase64Data()
    // //  await restoreOrBackupMongo('restore','mongodb+srv://ppuchetadev:6awQJNg5WD5GD6vq@cluster0.7yzio5l.mongodb.net/','daysapp')
    
   




    

} catch (error) {
    console.log(error)
}
