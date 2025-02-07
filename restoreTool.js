import { RestoreTool } from "./main.js"
import fs from 'fs'

const url1 = "mongodb+srv://ppuchetadev:aGpFTFsPDFAwxqwJ@victorinacluster.ycryc.mongodb.net/"
const pass = 'aGpFTFsPDFAwxqwJ'


const url2 = "mongodb+srv://ppuchetadev:O1i1jMe1IndUGWM3@clustertestconection.secyw.mongodb.net/"
const pass2 = "O1i1jMe1IndUGWM3"



try {
    
    

    await RestoreTool('restore',url1,'daysapp',"7-2-2025")
    await RestoreTool('restore',url2,'VeterinariaGatitas',"7-2-2025")

    


} catch (error) {
    console.log(error)
}
