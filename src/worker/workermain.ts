//FIXME: Find some way to run python and manifold code interleaved
//so we can use results like bbox size in python code

import {SuperToWorkerMessage,IAmReadyMessage,MessageType, RunPythonCodeMessage, PythonCodeResultMessage} from "../common/Message.js";
import {Color, Mesh} from "../common/Mesh.js";
// import {DrawCommand, DrawCommandType, Cube, Sphere, Cylinder, Difference, Union, Intersection, Translate, Scale, Rotate, Frustum, Hull, BoundingBox, Cut, Extrude, Revolve} from "../common/DrawCommand.js";

import Module, {Manifold, ManifoldToplevel, Mat4, Vec3} from "../ext/manifold/manifold.js";
import { ManifoldMeshWrapper, MeshHandle, manifoldMeshes, toDraw } from "./workertypes.js";

//do the import to force items to be set in 'self'
import {setManifold as tsshimsSetManifold} from "./tsshims.js";

// @ts-ignore
var __BRYTHON__: any;


let manifold: ManifoldToplevel;



let verbose=false;


//list of things that were printed by python code;
//we pass back to supervisor for output
let printed: string[] = [];



declare global {
    interface WorkerGlobalScope { impl_print : (s:string) => void }
};
self.impl_print = ( s: string ) => {
    printed.push(s);
};



async function loadBrython(): Promise<boolean> {
    let p = new Promise<boolean>( (resolveFunc, rejectFunc) => {
        __BRYTHON__.whenReady.then( () => { resolveFunc(true); } );
    });
    return p;
}


async function manifoldLoad(){
    const manifoldTopLevel = await Module();
    manifoldTopLevel.setup();
    manifold=manifoldTopLevel;
    tsshimsSetManifold(manifold)
}


export async function main(__BRYTHON__1: any){

    __BRYTHON__ = __BRYTHON__1;

    if(verbose)
        console.log("in worker main");
    
    await manifoldLoad();

    if(verbose)
        console.log("Manifold loaded");

    await loadBrython();

    if(verbose)
        console.log("Brython loaded");


    self.addEventListener( "message", (ev: MessageEvent) => {
        let msg = ev.data as SuperToWorkerMessage;
        if(verbose)
            console.log("Worker got message:",msg);

        switch(msg.type){
            case MessageType.ARE_YOU_READY:
                //supervisor is asking us if we're ready to go
                if(verbose)
                    console.log("worker: ready");
                self.postMessage( new IAmReadyMessage(msg.unique) );
                break;
            case MessageType.RUN_PYTHON_CODE:
                //supervisor wants us to run some python code
                //and report back the resulting meshes.
                if(verbose)
                    console.log("worker: run python");
                runPythonCode(msg as RunPythonCodeMessage);
                break;
            default:
                console.error("Unknown message type:"+msg.type);
        }
        if(verbose)
            console.log("Worker: Message handling done");
    });

    //post a message so the supervisor knows we're ready to go
    
    if(verbose)
        console.log("Worker notification: Ready now");

    self.postMessage(new IAmReadyMessage(-1));

    if(verbose)
        console.log("Leaving worker main");
}
 

type ImplDrawType = (drawable: MeshHandle) => void ;
declare global {
    interface WorkerGlobalScope { impl_draw : ImplDrawType }
};
self.impl_draw = (drawable: MeshHandle ) => {
    toDraw.push(drawable);
}

//FIXME: If you specify the same keyword argument twice to a Python function,
//Brython throws an exception with an unhelpful message and
//no line numbers.
function runPythonCode( pmsg: RunPythonCodeMessage )
{

    try{
        let errorLines: number[] = [];
        let errorPositions: number[][] = [];
        let errorMessages: string[] = [];
        
        try{
            let js = __BRYTHON__.pythonToJS(pmsg.code);
            eval(js);
        } catch(e: any){
            console.log("Exception:",e);
            for(let k in e){
                console.log("Exception key:",k,e[k]);
            }

            console.log("Line numbers:",e.$linenums);
            if(e.$linenums && e.$linenums.length > 0){
                errorLines = __BRYTHON__.pyobj2jsobj(e.$linenums);
            } else if( e.lineno !== undefined ){
                errorLines=[e.lineno];
            } else {
                console.log("e does not have line numbers",e);
            }
            if(e.$positions){
                errorPositions = __BRYTHON__.pyobj2jsobj(e.$positions);
            } else if( e.offset !== undefined ){
                errorPositions = [ [ e.offset, e.offset, e.offset+1 ] ]
            } else {
                console.log("e does not have positions",e.$positions);
            }
            if(e.args){
                let errorMessages1 = __BRYTHON__.pyobj2jsobj(e.args);
                for(let i=0;i<errorMessages1.length;++i){
                    if( typeof(errorMessages1[i]) === "string" ){
                        errorMessages.push(errorMessages1[i]);
                    }
                }
            } else {
                console.log("e does not have args");
            }
        }


        //convert from manifold mesh wrapper to mesh
        let meshes: Mesh[] = [];
        toDraw.forEach( (mh: MeshHandle) => {
            let mw: ManifoldMeshWrapper = manifoldMeshes[ mh.index ];
            let m = mw.mesh.getMesh();
            let me = new Mesh(m.vertProperties,m.triVerts,mw.color,mw.name);
            meshes.push(me);
            //defer mw.mesh.delete() to the finally block
        });

        let resp = new PythonCodeResultMessage(
            pmsg.unique, 
            meshes,
            printed,
            errorLines, 
            errorPositions, 
            errorMessages
        );

        if(verbose)
            console.log("Worker posting response:",resp);
        self.postMessage(resp);
    } finally {
        manifoldMeshes.forEach( (mw: ManifoldMeshWrapper) => {
            if( !mw.freed ){
                mw.mesh.delete();
                mw.freed=true;
            }
        })
        manifoldMeshes.splice(0,manifoldMeshes.length);
        printed.splice(0,printed.length);
        toDraw.splice(0,toDraw.length);
    }
}
