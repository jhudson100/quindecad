
//This class manages building the Python code
//to execute in the worker. It dispatches the work request
//to the WorkerManager and forwards the results to the
//ErrorReporter and View objects.

import {Editor} from "./Editor.js";
import { ErrorReporter } from "./ErrorReporter.js";
import { WorkerManager} from "./WorkerManager.js";
import {View} from "./View.js";
import { numPreambleLines, preambleStr } from "./PythonBuiltins.js";
import { PythonCodeResultMessage } from "../common/Message.js";


//for debugging
let verbose = false;
 

export class PythonManager{

    //this is a singleton class
    private static instance: PythonManager;

    private constructor(){
    }

    static get() {
        if(!PythonManager.instance)
            PythonManager.instance = new PythonManager();
        return PythonManager.instance;
    }

    async runCodeFromEditor(){
        

        //clear out messages from previous executions
        ErrorReporter.get().clear();

        //get the user's code
        let userCode = Editor.get().getValue(true);

        //concatenate with our built-in routines
        let finalCode = preambleStr + userCode;


        if(verbose){
            let tmp = finalCode.split("\n");
            for(let i=0;i<tmp.length;++i){
                console.log((i+1)+": "+tmp[i]);
            }
        }

        let result: PythonCodeResultMessage;
        try{
            result = await WorkerManager.get().runPythonAndComputeGeometry(finalCode);
        } catch(c){
            //promise was rejected. Worker might have been cancelled.
            //in that case, don't update the meshes or do anything else
            ErrorReporter.get().addMessage("Computation was interrupted");
            console.log("PythonManager: Rejected promise.");
            console.log(c);
            return;
        }
       
        if(verbose){
            console.log("super: PythonManager got result:",result);
        }

        //if we have things to print, output them first
        if(result.thingsToPrint){
            result.thingsToPrint.forEach( (s:string) => { 
                ErrorReporter.get().addMessage(s);
            });
        }

        //if there are error messages, report them
        if( result.errorMessages && result.errorMessages.length ){
            console.error(result);
            ErrorReporter.get().reportError(
                result.errorLineNumbers,
                result.errorPositions,
                result.errorMessages,
                numPreambleLines-1
            );
        }

        if( !result.meshes || !result.meshes.length ){
            //only display this message if there are no meshes and there are no error messages
            if( !result.errorMessages || result.errorMessages.length === 0 ){
                ErrorReporter.get().addMessage( "Warning: This code does not draw any objects.", "#aa8000");
                ErrorReporter.get().addMessage( "Hint: call draw() with an object or list of objects.", "#aa8000");
            }
        }

        if(result.meshes){
            View.get().setMeshes(result.meshes);
            if( result.cameraParameters && result.cameraParameters.length > 0 ){
                let c = result.cameraParameters;
                View.get().lookAt(c[0],c[1],c[2],  c[3],c[4],c[5],  0,0,1 );
            }
        } else {
            ErrorReporter.get().addMessage("An error occurred when setting meshes");
        }
    }

}
