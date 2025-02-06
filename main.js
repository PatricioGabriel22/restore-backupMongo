import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'
import {ArchivoSchema} from './config/schema.js'




function crearCarpetaBackup(dbAppName){

    if(!fs.existsSync('backups'))  fs.mkdirSync('backups')

    const fecha = new Date()
    const rutaDeEsteScript = fileURLToPath(import.meta.url)
    // const rutaDelFirectorio = path.join(__dirname,fecha)
    const __dirname = path.dirname(rutaDeEsteScript)

    const nombreDBorApp = dbAppName

    const rutaCarpetaPincipal = path.join(__dirname,"backups",nombreDBorApp)
    const nombreCarpeta = `Backup ${fecha.getDate().toString()}-${fecha.getMonth()+1}-${fecha.getFullYear()}`
    const rutaDirectorio = path.join(rutaCarpetaPincipal,nombreCarpeta) //uno dinamicamente los caminos de la ruta donde se crea la carpeta donde se haca cada backup. "Backups" es la general
    
    if(!fs.existsSync(rutaCarpetaPincipal)) fs.mkdirSync(rutaCarpetaPincipal)
    
    fs.mkdirSync(rutaDirectorio,{recursive:true})

    return rutaDirectorio
}



function decidirComando(backupOrRestore,clusterURL,dbName){

    const comandoMongoBackUp = `mongodump --uri ${clusterURL}${dbName}`
    
    const comandoMongoRestore= `mongorestore --uri ${clusterURL} `
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
        console.log(subDirectorios)

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



export async function restoreOrBackupMongo(comandoAEjecutar,clusterURL,dbName){
        //falta acomodar la parte de la fecha

    const comando = decidirComando(comandoAEjecutar,clusterURL,dbName)
    const rutaBase64Rest = path.join('Base64RestoredFiles',dbName)
    const carpeta = comandoAEjecutar === "backup" ? crearCarpetaBackup(dbName) :  rutaBase64Rest
    


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





// try {
    
//     restoreOrBackupMongo('restore')
// } catch (error) {
//     console.log(error)
// }