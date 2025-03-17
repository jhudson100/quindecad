import {setupInterface} from "./setup.js";
import {WorkerManager} from "./WorkerManager.js";
import {initialize as PythonBuiltinsInitialize} from "./PythonBuiltins.js";

async function main(){
    let ok = await WorkerManager.get().initialize();
    if(!ok)
        console.error("Could not initialize worker");

    await PythonBuiltinsInitialize();
    setupInterface();

}


window.onload = main;