import {setupInterface} from "./setup.js";
import {WorkerManager} from "./WorkerManager.js";
import {initialize as PythonBuiltinsInitialize} from "./PythonBuiltins.js";
import { GeometricObjectInitialize } from "./Objects/GeometricObject.js";


async function main(){
    let ok = await WorkerManager.get().initialize();
    if(!ok)
        console.error("Could not initialize worker");

    await PythonBuiltinsInitialize();

    await GeometricObjectInitialize();
    
    setupInterface();

}


window.onload = main;