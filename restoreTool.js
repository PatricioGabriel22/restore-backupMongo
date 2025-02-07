import { RestoreTool } from "./main.js"
import {dataDBS} from './dataDBS.js'




try {
    
    

    await RestoreTool('backup',dataDBS[0].url,'daysapp',"7-2-2025")
    await RestoreTool('backup',dataDBS[1].url,'VeterinariaGatitas',"7-2-2025")

    


} catch (error) {
    console.log(error)
}
