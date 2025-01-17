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

 

// function evaluateDrawCommand(cmd: DrawCommand): ManifoldMeshWrapper{
  
//     if(verbose)
//         console.log("worker: Evalute draw command:",cmd);

//     switch(cmd.type){
//         case DrawCommandType.UNION:
//         {
//             let spec = cmd as Union;
//             let o1 = evaluateDrawCommand(spec.object1);
//             let o2 = evaluateDrawCommand(spec.object2);
//             let d = manifold.Manifold.union(o1.mesh,o2.mesh);
//             o1.mesh.delete();
//             o2.mesh.delete();
//             let color = (cmd.color ?? o1.color) ?? o2.color;
//             return new ManifoldMeshWrapper(d,color);
//         }
//         case DrawCommandType.INTERSECTION:
//         {
//             let spec = cmd as Intersection;
//             let o1 = evaluateDrawCommand(spec.object1);
//             let o2 = evaluateDrawCommand(spec.object2);
//             let d = manifold.Manifold.intersection(o1.mesh,o2.mesh);
//             o1.mesh.delete();
//             o2.mesh.delete();
//             let color = (cmd.color ?? o1.color) ?? o2.color;
//             return new ManifoldMeshWrapper(d,color);
//         }
//         case DrawCommandType.TRANSLATE:
//         {
//             let spec = cmd as Translate;
//             let o1 = evaluateDrawCommand(spec.object1);
//             let o2 = o1.mesh.translate([spec.tx,spec.ty,spec.tz]);
//             o1.mesh.delete();
//             return new ManifoldMeshWrapper( o2, cmd.color ?? o1.color ) ;  
//         }
//         case DrawCommandType.SCALE:
//         {
//             let spec = cmd as Scale;
//             let o1 = evaluateDrawCommand(spec.object1);
//             if( spec.centroid ){
//                 let bbox = o1.mesh.boundingBox();
//                 let cx = 0.5*( bbox.min[0] + bbox.max[0] );
//                 let cy = 0.5*( bbox.min[1] + bbox.max[1] );
//                 let cz = 0.5*( bbox.min[2] + bbox.max[2] );
//                 let o2 = o1.mesh.translate([-cx,-cy,-cz]);
//                 let o3 = o2.scale([spec.sx,spec.sy,spec.sz]);
//                 let o4 = o3.translate([cx,cy,cz]);
//                 o1.mesh.delete();
//                 o2.delete();
//                 o3.delete();
//                 return new ManifoldMeshWrapper( o4, cmd.color ?? o1.color ); 
//             } else {
//                 let o2 = o1.mesh.scale([spec.sx,spec.sy,spec.sz]);
//                 o1.mesh.delete();
//                 return new ManifoldMeshWrapper( o2, cmd.color ?? o1.color ); 
//             }
//         }
//         case DrawCommandType.HULL:
//         {
//             let spec = cmd as Hull;
//             let lst: Manifold[] = [];
//             for(let i=0;i<spec.objects.length;++i){
//                 lst.push( evaluateDrawCommand(spec.objects[i]).mesh);
//             }
//             let o2 = manifold.Manifold.hull(lst);
//             lst.forEach( (m: any) => {
//                 m.delete();
//             });
//             return new ManifoldMeshWrapper( o2, cmd.color );
//         }
//          case BoundingBox:
//              call m.boundingBox and return back the two corners of the box as a list
//         case DrawCommandType.BBOX <-- maybe have better name for this: 
//         {
//             let spec = cmd as BoundingBox;
//             let mins: Vec3=[Infinity,Infinity,Infinity];
//             let maxs: Vec3=[-Infinity,-Infinity,-Infinity];

//             let objects: DrawCommand[] = [];

//             //don't use instanceof testing here
//             if( (  (spec.objects as DrawCommand).type) !== undefined ){
//                 objects = [spec.objects as DrawCommand];
//             } else {
//                 objects = spec.objects as DrawCommand[];
//             }

//             for(let i=0;i<objects.length;++i){
//                 let m = evaluateDrawCommand(objects[i]).mesh;
//                 let b = m.boundingBox();
//                 for(let j=0;j<3;++j){
//                     mins[j] = Math.min(mins[j],b.min[j]);
//                     maxs[j] = Math.max(maxs[j],b.max[j]);
//                 }
//                 m.delete();
//             }

//             for(let j=0;j<3;++j){
//                 if(!isFinite(mins[j]) || !isFinite(maxs[j]) ){
//                     mins = [0,0,0];
//                     maxs = [0,0,0];
//                 }
//             }

//             mins[0] += spec.offsetnx;
//             maxs[0] += spec.offsetpx;
//             mins[1] += spec.offsetny;
//             maxs[1] += spec.offsetpy;
//             mins[2] += spec.offsetnz;
//             maxs[2] += spec.offsetpz;

//             let c1 = manifold.Manifold.cube( [maxs[0]-mins[0], maxs[1]-mins[1], maxs[2]-mins[2]], false );
//             let c2 = c1.translate(mins);
//             c1.delete();
//             return new ManifoldMeshWrapper(c2,cmd.color);
//         }
//         case DrawCommandType.CUT:
//         {
//             let spec = cmd as Cut;
//             let o1 = evaluateDrawCommand(spec.object1);
//             let results = o1.mesh.splitByPlane([spec.planeA,spec.planeB,spec.planeC], spec.planeD);
//             let ki = ( spec.keepPositive ? 0 : 1 );
//             results[1-ki].delete();
//             return new ManifoldMeshWrapper( results[ki], spec.color ?? o1.color );
//         }
//         case DrawCommandType.EXTRUDE:
//         {
//             let spec = cmd as Extrude;
//             let o1 = manifold.Manifold.extrude(
//                     spec.polygon, 
//                     spec.height ?? 1, 
//                     spec.divisions ?? 1, 
//                     (spec.twist ?? 0 )/Math.PI*180 ?? 0, 
//                     spec.scale ?? [1,1], 
//                     spec.zcenter);
//             return new ManifoldMeshWrapper( o1, spec.color );
//         }
//         case DrawCommandType.REVOLVE:
//         {
//             let spec = cmd as Revolve;
//             let o1 = manifold.Manifold.revolve(
//                     spec.polygon, 
//                     spec.resolution ?? 36, 
//                     (spec.angle ?? 2*Math.PI)/Math.PI * 180  );

//             return new ManifoldMeshWrapper( o1, spec.color );
//         }
//         case DrawCommandType.ROTATE:
//         {   
//             let spec = cmd as Rotate;
//             let o1 = evaluateDrawCommand(spec.object1);

//             //ref: https://en.wikipedia.org/wiki/Rotation_matrix
//             //ref: https://ai.stackexchange.com/questions/14041/how-can-i-derive-the-rotation-matrix-from-the-axis-angle-rotation-vector
            
//             let c = Math.cos(spec.angle);
//             let c1 = 1-c;
//             let s = Math.sin(spec.angle);
//             let x = spec.axisx;
//             let y = spec.axisy;
//             let z = spec.axisz;

//             let len = Math.sqrt(x*x+y*y+z*z);
//             if(len === 0 ){
//                 console.warn("Zero length rotation axis");
//                 return o1;
//             }

//             x /= len;
//             y /= len;
//             z /= len;

//             //this is in COLUMN major order!
//             let M: Mat4 = [
//                 x*x*c1+c,
//                 x*y*c1+z*s,
//                 x*z*c1-y*s,
//                 0,

//                 y*x*c1-z*s,
//                 y*y*c1+c,
//                 y*z*c1+x*s,
//                 0,

//                 x*z*c1+y*s,
//                 y*z*c1-x*s,
//                 z*z*c1+c,
//                 0,

//                 0,0,0,1
//             ]

//             if( spec.centroid ){
//                 let bbox = o1.mesh.boundingBox();
//                 let cx = 0.5*( bbox.min[0] + bbox.max[0] );
//                 let cy = 0.5*( bbox.min[1] + bbox.max[1] );
//                 let cz = 0.5*( bbox.min[2] + bbox.max[2] );
//                 let o2 = o1.mesh.translate([-cx,-cy,-cz]);
//                 let o3 = o1.mesh.transform(M);
//                 let o4 = o3.translate([cx,cy,cz]);
//                 o1.mesh.delete();
//                 o2.delete();
//                 o3.delete();
//                 return new ManifoldMeshWrapper( o4, cmd.color ?? o1.color ); 
//             } else {
//                 let o2 = o1.mesh.transform(M);
//                 o1.mesh.delete();
//                 return new ManifoldMeshWrapper( o2, cmd.color ?? o1.color ); 
//             }
//         }
//         default:
//             console.error(cmd);
//             throw new Error("Internal error: Unknown draw command type:"+cmd.type);
//     }
// }

//FIXME: Add a way to immediately delete a mesh handle's wrapped mesh
// with the caveat that any further use of that object will give an error.
// This would allow manual garbage collection if a large number of temporaries
// are being produced.

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
            let me = new Mesh(m.vertProperties,m.triVerts,mw.color);
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
            mw.mesh.delete();
        })
        manifoldMeshes.splice(0,manifoldMeshes.length);
        printed.splice(0,printed.length);
        toDraw.splice(0,toDraw.length);
    }
}
