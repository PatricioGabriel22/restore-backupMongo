import { restoreOrBackupMongo } from "./main.js";


const pass = 'aGpFTFsPDFAwxqwJ'
try {
   
    restoreOrBackupMongo('backup',pass,'daysapp')
} catch (error) {
    console.log(error)
}

