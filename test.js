import { restoreOrBackupMongo } from "./main.js";

try {
    
    restoreOrBackupMongo('restore')
} catch (error) {
    console.log(error)
}