import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'
import {ArchivoSchema} from './config/schema.js'
import { connectRestoreScriptCluster } from "./config/mongoDB.js";


export let rutaDirectorio = ''
function crearCarpetaBackup(dbAppName){

    if(!fs.existsSync('backups'))  fs.mkdirSync('backups')

    const fecha = new Date()
    const rutaDeEsteScript = fileURLToPath(import.meta.url)
    // const rutaDelFirectorio = path.join(__dirname,fecha)
    const __dirname = path.dirname(rutaDeEsteScript)

    const nombreDBorApp = dbAppName

    const rutaCarpetaPincipal = path.join(__dirname,"backups",nombreDBorApp)
    const nombreCarpeta = `${fecha.getDate().toString()}-${fecha.getMonth()+1}-${fecha.getFullYear()}`
    rutaDirectorio = path.join(rutaCarpetaPincipal,nombreCarpeta) //uno dinamicamente los caminos de la ruta donde se crea la carpeta donde se haca cada backup. "Backups" es la general
    
    if(!fs.existsSync(rutaCarpetaPincipal)) fs.mkdirSync(rutaCarpetaPincipal)
    
    fs.mkdirSync(rutaDirectorio,{recursive:true})

    return rutaDirectorio
}



function decidirComando(backupOrRestore,clusterURL,dbName){

    const comandoMongoBackUp = `mongodump --uri ${clusterURL}${dbName}`
    
    const comandoMongoRestore= `mongorestore --uri ${clusterURL} --drop`
    //--dir=Base64RestoredFiles/${dbName}/dump --nsInclude=${dbName}.*
    let opciones = {
        modo:'',
        msg:''
    }

    if(backupOrRestore === 'backup'){

        opciones['modo'] =  comandoMongoBackUp 
        opciones['msg'] = "Ejecutando script en modo backup"

    } else if (backupOrRestore === 'restore'){

        opciones['modo'] = comandoMongoRestore
        opciones['msg'] = "Ejecutando script en modo restore"
    }else{
        throw new Error("No se especifico un comando.")
    }

    return opciones
}


export async function readFilesAndUploadDB(){

    const directorios = fs.readdirSync('backups')
    
    const ahora = new Date()
    const gmt3 = new Date(ahora.getTime() - 3 * 60 * 60 * 1000)

    
    for(let directorio of directorios){
        let archivos 

        const subDirectorios = fs.readdirSync(path.join('backups',directorio))
       

        await Promise.all(

            subDirectorios.map(async (subDirectorio)=>{
                let dataFromArchivos = []

                const direccionConData = `backups/${directorio}/${subDirectorio}/dump/${directorio}`
                archivos = fs.readdirSync(direccionConData)
    
                archivos.map((archivo)=>{
                    dataFromArchivos.push(fs.readFileSync(`${direccionConData}/${archivo}`))
                })    

                
                const archivoModel = mongoose.model(`${directorio}`, ArchivoSchema)
        
                const target = await archivoModel.findOne({
                    nombre: `${directorio}`,
                    fecha: `${subDirectorio}` , 
                    archivos:dataFromArchivos
                }) 

                
                
                if(!target){
                    await archivoModel.create({
                        nombre: `${directorio}`,
                        fecha: `${subDirectorio}` , 
                        archivos:dataFromArchivos
                    })
                }                
            })

        )



      
        
    }

}



export async function restoreOrBackupMongo(comandoAEjecutar,clusterURL,dbName,dateToRestore=""){
        //falta acomodar la parte de la fecha

    const comando = decidirComando(comandoAEjecutar,clusterURL,dbName)
    let carpeta = ''
    let rutaBase64Rest = ''

    if(comandoAEjecutar === 'backup'){
        carpeta = crearCarpetaBackup(dbName)

    }else if(comandoAEjecutar == 'restore'){

        rutaBase64Rest = path.join('Base64RestoredFiles',dbName,dateToRestore)
        if (!fs.existsSync(rutaBase64Rest)) throw new Error(`No es posible resturar ${dbName} al ${dateToRestore}`) 
        
        carpeta = rutaBase64Rest
    }



    

    


    console.log(`Ejecutando script en ${carpeta}`)

    return new Promise((resolve, reject) => {
        exec(comando.modo, { cwd: `${carpeta}` }, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Error: ", error.message);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn("⚠️ Advertencia: ", stderr);
            }

            console.log("✅ Completado", stdout);
            resolve(stdout);
        });
    });
}



export function getDocumentsNames(directory){
    if(!directory) throw new Error("Debe ingresar una ruta de directorio")

    const FulldocumentsNames = fs.readdirSync(directory)

    

    let baseDocumentNames = []

    FulldocumentsNames.map((docuName)=>{
        
        baseDocumentNames.push(docuName.split('.')[0])
    })
    return baseDocumentNames
}



export async function restoreBase64Data(){
    // mongoose.connection.readyState === 0 ? await connectDB() : ''

    let allDBcollections = []
    
    const db =  mongoose.connection.db
    const collections =  await db.listCollections().toArray() //aca consigo la lista de colecciones
    
    
    
    for(const collection of collections){
        let aux
        
        const collectionName = collection.name //nombre de las colecciones
        const collectionTarget =  mongoose.connection.collection(collectionName)//aca me conecto con ellas
       
        aux = await collectionTarget.find().toArray() //aca me traigo un objeto con todo el contenido de las colecciones

        
        allDBcollections.push(...aux)

        
    }
        
         
    //a estas colecciones les tengo qe transformar sus arhcivos de Base64 nuevamente aarchovos como tal con un buffer
  

    const backupPath = 'Base64RestoredFiles'
    if(!fs.existsSync(backupPath)) fs.mkdirSync(backupPath)

    allDBcollections.forEach((collection)=>{
        const rutaCarpeta = `backups/${collection.nombre}/${collection.fecha}/dump/${collection.nombre}`
        if(!fs.existsSync(rutaCarpeta)) return
        
        const nombresDocumentsDirectoryPath = getDocumentsNames(rutaCarpeta)
        //---Usar en caso de querer hacer subcarpetas----//
        const rutaDirCollection = path.join(backupPath,collection.nombre,collection.fecha,"dump",collection.nombre)
        fs.mkdirSync(rutaDirCollection,{recursive:true}) //aca se crea la subcarpeta
        
      
        collection.archivos.map((archivo,index)=>{
            if(index%2 === 0){

                const buffer = archivo.buffer //crea un buffer para cada elemento de Base64
               
                const fileName = `${nombresDocumentsDirectoryPath[index]}.bson`
                
                
                fs.writeFileSync(`${rutaDirCollection}/${fileName}`,buffer)
            }
            
        })
    })
}



export async function RestoreTool(action,uriDB,dbName,date=""){

    const connected = await connectRestoreScriptCluster()

    if(connected){

        if(action == 'backup'){
            await restoreOrBackupMongo(action,uriDB,dbName)
            await readFilesAndUploadDB()
            return 
        } 

        if(action == 'restore'){
            await restoreBase64Data()
            await restoreOrBackupMongo(action,uriDB,dbName,date)
            return

        }
        
        if(!action){
        throw new Error("No se selecciono una accion valida")
        }


    }else{
        throw new Error("No se pudo conectar a la DB donde se van a almacenar los datos")
    }  
    
}


