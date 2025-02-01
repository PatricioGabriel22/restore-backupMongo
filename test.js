import { restoreOrBackupMongo } from "./main.js";
import fs from 'fs'
import { connectDB } from "./config/mongoDB.js";
import {ArchivoModel} from './config/schema.js'
import mongoose from "mongoose";
import { arch } from "os";
import path from "path";



const pass = 'aGpFTFsPDFAwxqwJ'
try {
    // connectDB()

    restoreOrBackupMongo('backup',pass,'daysapp')
    restoreOrBackupMongo('backup',"6awQJNg5WD5GD6vq",'test')


    // const archivos = fs.readdirSync('backups')
    // console.log(archivos)
    // archivos.map(async (archivo)=>{
    //     const data = fs.readdirSync(`backups/${archivo}/dump/daysapp`)
    //     await ArchivoModel.create({nombre: archivo, archivos:data})
    //     console.log("Saved")
        
    // })


    //---------------------guardar archivos en DB--------------------

    ///Backup 31-1-2025/dump/daysapp

    function readFilesAndUploadDB(){

        const directorios = fs.readdirSync('backups')
        console.log(directorios)
        
        let archivos 
        let dataFromArchivos = []
    
        directorios.forEach(async (directorio)=>{
            const direccion = `backups/${directorio}/dump/daysapp`
            archivos = fs.readdirSync(direccion)
    
            archivos.map((archivo)=>{
                dataFromArchivos.push(fs.readFileSync(`${direccion}/${archivo}`))
            })    
    
            await ArchivoModel.create({nombre: `${directorio}`, archivos:dataFromArchivos})
        })
    }




    // const data = []
    // archivos.map(async (archivo)=>{
    //     data.push(fs.readFileSync(`backups/Backup 31-1-2025/dump/daysapp/${archivo}`))
    // })
    // await ArchivoModel.create({nombre: "archivo", archivos:data})

    //-------------para recuperar a partir de base64----------------
   
   
    let allDBcollections = []
    
   

    // mongoose.connection.once('open',async ()=> {
    //     const db =  mongoose.connection.db
    //     const collections =  await db.listCollections().toArray() //aca consigo la lista de colecciones
        
    //     for(const collection of collections){
    //         let aux
    //         const collectionName = collection.name //nombre de las colecciones
    //         const collectionTarget =  mongoose.connection.collection(collectionName)//aca me conecto con ellas
    //         aux = await collectionTarget.findOne() //aca me traigo un objeto con todo el contenido de las colecciones

            
    //         allDBcollections.push(aux)

            
    //     }
        
        
       
        
    //     //a estas colecciones les tengo qe transformar sus arhcivos de Base64 nuevamente aarchovos como tal con un buffer

        

    //     const backupPath = 'RecoveryFiles'

    //     if(!fs.existsSync(backupPath)) fs.mkdirSync(backupPath)

    //     allDBcollections.forEach((collection)=>{
    //         //---Usar en caso de querer hacer subcarpetas----//

    //         // const rutaDirCollection = path.join(backupPath,collection.nombre)
    //         // console.log(collection.nombre)
    //         // fs.mkdirSync(rutaDirCollection,{recursive:true}) //aca se crea la subcarpeta

    //         collection.archivos.map((archivo,index)=>{
    //             const buffer = archivo.buffer  //crea un buffer para cada elemento de Base64
                
    //             const fileName = index%2 === 0 ? `${collection.nombre}.bson`:`${collection.nombre}.metadata.json`
                
                
    //             fs.writeFileSync(`${backupPath}/${fileName}`,buffer)
                
    //         })
    //     })

    // })


    

} catch (error) {
    console.log(error)
}

