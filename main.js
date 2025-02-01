import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import {connectDB} from './config/mongoDB.js'
// import {ArchivoSchema} from './config/schema.js'





function crearCarpetaBackup(dbAppName){
    const fecha = new Date()
    const rutaDeEsteScript = fileURLToPath(import.meta.url)
    // const rutaDelFirectorio = path.join(__dirname,fecha)
    const __dirname = path.dirname(rutaDeEsteScript)

    const nombreDBorApp = dbAppName

    const rutaCarpetaPincipal = path.join(__dirname,"backups",nombreDBorApp)
    const nombreCarpeta = `Backup 2 ${fecha.getDate().toString()}-${fecha.getMonth()+1}-${fecha.getFullYear()}`
    const rutaDirectorio = path.join(rutaCarpetaPincipal,nombreCarpeta) //uno dinamicamente los caminos de la ruta donde se crea la carpeta donde se haca cada backup. "Backups" es la general
    
    if(!fs.existsSync(rutaCarpetaPincipal)) fs.mkdirSync(rutaCarpetaPincipal)
    
    fs.mkdirSync(rutaDirectorio,{recursive:true})

    return rutaDirectorio
}


function decidirComando(backupOrRestore,dbPassword,dbName){

    const comandoMongoBackUp = `mongodump --uri mongodb+srv://ppuchetadev:${dbPassword}@victorinacluster.ycryc.mongodb.net/${dbName}`
    
    const comandoMongoRestore= `mongorestore --uri mongodb+srv://ppuchetadev:${dbPassword}@victorinacluster.ycryc.mongodb.net`

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

export function restoreOrBackupMongo(comandoAEjecutar,dbPassword,dbName){
    
    


    const comando = decidirComando(comandoAEjecutar,dbPassword,dbName)
    const carpeta = crearCarpetaBackup(dbName)
    console.log(carpeta)
    exec(comando.modo,{cwd:`${carpeta}`},(error,stdout,stderr)=>{
        console.log(comando.msg)
        let msg = stdout
        if(error) msg = error.message
        if(stderr) msg = stderr
    
        console.log(msg)
        return 
    })


}

// try {
    
//     restoreOrBackupMongo('restore')
// } catch (error) {
//     console.log(error)
// }