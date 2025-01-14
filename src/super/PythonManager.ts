
//This class manages building the Python code
//to execute in the worker. It dispatches the work request
//to the WorkerManager and forwards the results to the
//ErrorReporter and View objects.

import {Editor} from "Editor";
import { ErrorReporter } from "ErrorReporter";
import {PythonResult, WorkerManager} from "WorkerManager";
import {DrawCommand, DrawCommandType} from "../common/DrawCommand";
import {Mesh} from "../common/Mesh";
import {View} from "View";
import { numPreambleLines, preambleStr, initialize as pythonBuiltinsInitialize } from "./PythonBuiltins.js";


//for debugging
let verbose = false;
 

export class PythonManager{

    private static instance: PythonManager;

    private constructor(){
        pythonBuiltinsInitialize();
    }

    static get() {
        if(!PythonManager.instance)
            PythonManager.instance = new PythonManager();
        return PythonManager.instance;
    }

    async runCodeFromEditor(){
        

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

        let result: PythonResult;
        try{
            result = await WorkerManager.get().runPythonAndComputeGeometry(finalCode);
        } catch(c){
            //promise was rejected. Worker might have been cancelled.
            //in that case, don't update the meshes or do anything else
            console.log("PythonManager: Rejected promise.");
            return;
        }
        
        // let result = combinedResult.result;
        // let meshes = result.meshes;
        // let csgerrors = combinedResult.error;

        if(verbose){
            console.log("super: PythonManager got result:",result);
        }

        //clear out errors from previous executions
        ErrorReporter.get().clear();

        //if we have things to print, output them first
        if(result.printables){
            result.printables.forEach( (s:string) => { 
                ErrorReporter.get().addMessage(s);
            });
        }

        if( result.errorMessages && result.errorMessages.length ){
            console.error(result);
            ErrorReporter.get().reportError(
                result.errorLineNumbers,
                result.errorPositions,
                result.errorMessages,
                numPreambleLines-1
            );
            return;
        }

        if( !result.meshes || !result.meshes.length ){
            ErrorReporter.get().addMessage( "Warning: This code does not draw any objects.", "#aa8000");
            ErrorReporter.get().addMessage( "Hint: call draw() with an object or list of objects.", "#aa8000");
            return;
        }

        // if( csgerrors ){
            // ErrorReporter.get().addMessage(csgerrors);
        // }

        //compute the surface associated with these drawables
        // let drawables: DrawCommand[] = result.commands;
        // let M: Mesh[] = await WorkerManager.get().computeGeometry(drawables);
        if(result.meshes){
            View.get().setMeshes(result.meshes);
            if(!result.printables ){
                ErrorReporter.get().nothingToReport();
            }
        } else {
            ErrorReporter.get().reportError(
                [], [], ["An internal error occurred when computing meshes"],
                0
            );
            return;
        }
    }

}
