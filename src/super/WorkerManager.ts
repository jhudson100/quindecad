//The WorkerManager handles all communication to/from the Web Worker.
//It dispatches a request to the worker and awaits the response.



import {Mesh} from "Mesh";
import {ComputeGeometryMessage, GeometryComputedMessage, PythonCodeResultMessage, RunPythonCodeMessage, WorkerToSuperMessage} from "Message";
import {DrawCommand} from "DrawCommand";

const WORKERPATH="./worker/workerbootstrap.js";

let verbose=false;

//if undefined is passed in, that indicates the worker was terminated before
//sending a response.
type ResponseCallback = (m: WorkerToSuperMessage|undefined) => void;

type WorkerStatusCallback = (isBusy: boolean) => void;

interface PythonResult {
    //things to draw/compute CSG for
    commands: DrawCommand[];    
    //messages the worker wrote with print()
    printables: string[];       
    //line numbers where errors occurred (a traceback); most recent
    //function call is last
    errorLineNumbers: number[]; 
    //column numbers where the error occurred. start, start, end.
    errorPositions: number[][];
    //messages describing the error
    errorMessages: string[];
}


function receivedMessageFromWorker(ev: MessageEvent){
    WorkerManager.get().receivedMessageFromWorker(ev);
}


export class RunAndComputeResult{
    result: PythonResult
    meshes: Mesh[];
    error: string;
    constructor(result:PythonResult, meshes:Mesh[], error: string){
        this.result=result;
        this.meshes=meshes;
        this.error=error;
    }
}

   
export class WorkerManager{

    private static instance: WorkerManager;

    worker: Worker;

    //functions to be called when we get a message from the worker
    //with a particular "in response to" flag.
    //If a worker is cancelled, the callbacks will be called with 
    //undefined as a parameter.
    callbacks: Map<number,ResponseCallback>;

    busyLevel=0;

    onBusyCallbacks: WorkerStatusCallback[] = [];
    onIdleCallbacks: WorkerStatusCallback[] = [];
    
    pendingPromises: any[] = [];

    private constructor(){
        this.callbacks = new Map();

        // @ts-ignore
        this.worker=undefined;
    }

    registerWorkerBusyCallback(f: WorkerStatusCallback ){
        this.onBusyCallbacks.push(f);
    }
    registerWorkerIdleCallback(f: WorkerStatusCallback ){
        this.onIdleCallbacks.push(f);
    }
    
    private workerIsNowBusy(){
        this.busyLevel++;
        if(this.busyLevel === 1 ){
            this.onBusyCallbacks.forEach( (f: WorkerStatusCallback) => {
                f(true);
            });
        }
    }
    private workerIsNowIdle(){
        this.busyLevel--;
        if( this.busyLevel === 0 ){
            this.onIdleCallbacks.forEach( (f: WorkerStatusCallback) => {
                f(false);
            });
        }
    }

    isWorkerBusy(){
        return this.busyLevel > 0;
    }
    
    //This must be called before any other WorkerManager functions
    async initialize(): Promise<boolean> {
        if( this.worker === undefined ){
            return this.createWorker();
        } else {
            let p = new Promise<boolean>( (resolveFunc, rejectFunc) => {
                resolveFunc(true);
            });
            return p;
        }
    }

    async stopWorker() : Promise<boolean> {
        console.log("Stop worker");
        let p = new Promise<boolean>( (res,rej) => {
            if( this.worker ){
                //ensure that if there are any messages in the pipeline they
                //will be discarded
                this.worker.removeEventListener("message", receivedMessageFromWorker );
                //stop the worker
                this.worker.terminate();
                this.worker = undefined;

                this.callbacks.forEach( (f: ResponseCallback) => {
                    f(undefined);   //tell callback the worker was terminated
                });

                //remove any pending callbacks waiting for messages from the worker
                this.callbacks.clear();

                if( this.busyLevel > 0 ){
                    this.busyLevel = 1;     //simulate worker going idle so we call the callbacks
                    this.workerIsNowIdle();
                }
                //create a new worker for later use
                return this.createWorker();
            } else {
                res(true);
            }
        });
        return p;
    }

    private async createWorker(): Promise<boolean>{
        if(verbose)
            console.log("initialize worker...");

        let p = new Promise<boolean>( (resolveFunc,rejectFunc) => {
            this.callbacks.set(-1, (msg: WorkerToSuperMessage) => {
                if( msg === undefined )
                    rejectFunc("Worker was terminated");
                else
                    resolveFunc(true);
            });
            
            //FIXME: Add error detection if worker doesn't start?

            if(verbose)
                console.log("Worker new");

            this.worker = new Worker(WORKERPATH);

            //we make this a global function because
            //we have to be able to pass it to removeEventListener() later.
            this.worker.addEventListener("message", receivedMessageFromWorker);
            console.log("worker created");
        });

        return p;
    }
    
    //the global receivedMessageFromWorker function just calls
    //this function.
    receivedMessageFromWorker(ev: MessageEvent){
        let data = ev.data as WorkerToSuperMessage;
        let irt = data.inResponseTo;
        if( this.callbacks.has(irt)){
            let f = this.callbacks.get(irt);
            this.callbacks.delete(irt);
            if(f){
                f(data);
            }
        } else {
            console.error("Got bad message",data);
        }
    }

    //singleton pattern
    static get(){
        if(!WorkerManager.instance)
            WorkerManager.instance = new WorkerManager();
        return WorkerManager.instance;
    }

    runPythonAndComputeGeometry(code: string): Promise<RunAndComputeResult>{
        let p = new Promise<RunAndComputeResult>( (res,rej) => {

            //mark worker as busy
            this.workerIsNowBusy();

            if(verbose)
                console.log("Super: Requesting worker to run python");
        
            //prepare message to send to worker
            let m = new RunPythonCodeMessage(code);
            if(verbose)
                console.log("Super: Posting message to worker:",m);

            //when python code execution is complete, compute geometry
            //on any drawable objects that came back
            this.callbacks.set(m.unique, (wmsg: WorkerToSuperMessage|undefined) => {
                this.runPythonAndComputeGeometryPart2(res,rej,wmsg);
            });
            this.worker.postMessage(m);
        });
        return p;
    }

    private runPythonAndComputeGeometryPart2( res: any, rej: any, wmsg: WorkerToSuperMessage|undefined) {
        
        if( wmsg === undefined ){
            //worker was cancelled
            rej("Worker was cancelled");
            return;
        }

        let p = wmsg as PythonCodeResultMessage;

        //construct message asking for geometry to be computed
        let msg = new ComputeGeometryMessage(p.commands);

        //when geometry has been computed, the promise can
        //be resolved.
        this.callbacks.set( msg.unique, (wsmsg: WorkerToSuperMessage) => {
            this.runPythonAndComputeGeometryPart3( res, rej, p, wsmsg);
        });
        this.worker.postMessage(msg);
    }

    private runPythonAndComputeGeometryPart3( res: any, rej: any, p: PythonCodeResultMessage, wsmsg: WorkerToSuperMessage|undefined) {
        if( wsmsg === undefined ){
            //worker was terminated
            rej("Worker was terminated");
            return;
        }

        let wmsg = wsmsg as GeometryComputedMessage
        if(verbose)
            console.log("Super: Got computed geometry",wmsg);

        this.workerIsNowIdle();
        let tmp = new RunAndComputeResult(p,wmsg.meshes,wmsg.error);
        res(tmp);
    }
}

 





    //         this.runPythonCode(code).then( (result: PythonResult ) => {
    //             let mesh: Mesh; 
    //             if( result.commands ){
    //                 this.computeGeometry(result.commands).then( (meshes: Mesh[] ) => {
                       
    //                 });
    //             }
    //         });
    //     });
    //     this.addPromise(p);
    //     return p;
    // }


    // //Ask the worker to compute geometry given a series of draw commands.
    // async computeGeometry(drawables: DrawCommand[]): Promise<Mesh[]> {
    //     let p = new Promise<Mesh[]>( (resolveFunc,rejectFunc) => {
           
    //     });
    //     this.addPromise(p);
    //     return p;
    // }

    // //dispatch a message to the worker asking it to run the given
    // //python code. Gets back a message with the results of the computation
    // //or the exception that was thrown.
    // async runPythonCode(code: string) : Promise<PythonResult>{
       
    // }


   