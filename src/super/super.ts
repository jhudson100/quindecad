import {setupInterface} from "./setup.js";
import {WorkerManager} from "./WorkerManager.js";

async function main(){
    let ok = await WorkerManager.get().initialize();
    if(!ok)
        console.error("Could not initialize worker");

    setupInterface();

}


window.onload = main;