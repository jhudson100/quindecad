import {setupInterface} from "setup";
import {WorkerManager} from "WorkerManager";
import {PythonManager} from "PythonManager";
import { initialize as PythonBuiltinsInitialize } from "PythonBuiltins";

async function main(){
    // console.log("In super main");

    let ok = await WorkerManager.get().initialize();
    if(!ok)
        console.error("Could not initialize worker");

    ok = await PythonBuiltinsInitialize();
    if(!ok)
        console.error("Could not initialize python builtins");

    setupInterface();

    await PythonManager.get().runCodeFromEditor();
 
    // let d = new Dialog( [
    //     {name:"OK", callback: ()=>{ console.log("OK!"); d.hide() } },
    //     {name: "Cancel"}
    // ]);
    // d.show();
}


window.onload = main;