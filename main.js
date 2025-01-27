import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'






function crearCarpetaBackup(){
    const fecha = new Date()
    const rutaDeEsteScript = fileURLToPath(import.meta.url)
    
    // const rutaDelFirectorio = path.join(__dirname,fecha)
    const __dirname = path.dirname(rutaDeEsteScript)
    const nombreCarpeta = `Backup ${fecha.getDate().toString()}-${fecha.getMonth()+1}-${fecha.getFullYear()}`
    const rutaDirectorio = path.join(__dirname,nombreCarpeta)
    
    
    fs.mkdirSync(rutaDirectorio,{recursive:true})

    return rutaDirectorio
}

function decidirComando(backupOrRestore){

    const comandoMongoBackUp = `mongodump --uri mongodb+srv://ppuchetadev:${`aGpFTFsPDFAwxqwJ`}@victorinacluster.ycryc.mongodb.net/${`daysapp`}`
    
    const comandoMongoRestore= `mongorestore --uri mongodb+srv://ppuchetadev:${`aGpFTFsPDFAwxqwJ`}@victorinacluster.ycryc.mongodb.net`

    let comandoElegido = ''

    if(backupOrRestore === 'backup'){

        comandoElegido =  comandoMongoBackUp 

    } else if (backupOrRestore === 'restore'){

        comandoElegido = comandoMongoRestore
    }else{
        throw new Error("No se especifico un comando.")
    }

    return comandoElegido
}

export function restoreOrBackupMongo(comandoAEjecutar){
    
    


    const comando = decidirComando(comandoAEjecutar)
    const carpeta = crearCarpetaBackup()

    exec(comando,{cwd:carpeta},(error,stdout,stderr)=>{
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