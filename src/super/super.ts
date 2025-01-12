import {setupInterface} from "setup";
import {WorkerManager} from "WorkerManager";
import {PythonManager} from "PythonManager";
import { Dialog } from "Dialog";

async function main(){
    // console.log("In super main");

    // console.log("Creating WorkerManager");
    let ok = await WorkerManager.get().initialize();
    // console.log("Worker started and ready");

    setupInterface();

    await PythonManager.get().runCodeFromEditor();
 
    // let d = new Dialog( [
    //     {name:"OK", callback: ()=>{ console.log("OK!"); d.hide() } },
    //     {name: "Cancel"}
    // ]);
    // d.show();
}


window.onload = main