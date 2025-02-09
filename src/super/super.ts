import {setupInterface} from "./setup.js";
import {WorkerManager} from "./WorkerManager.js";
import { initialize as PythonBuiltinsInitialize } from "./PythonBuiltins.js";

async function main(){
    // console.log("In super main");

    let ok = await WorkerManager.get().initialize();
    if(!ok)
        console.error("Could not initialize worker");

    ok = await PythonBuiltinsInitialize();
    if(!ok)
        console.error("Could not initialize python builtins");

    setupInterface();

    //await PythonManager.get().runCodeFromEditor();
 
    // let d = new Dialog( [
    //     {name:"OK", callback: ()=>{ console.log("OK!"); d.hide() } },
    //     {name: "Cancel"}
    // ]);
    // d.show();
}


window.onload = main;