//The WorkerManager handles all communication to/from the Web Worker.
//It dispatches a request to the worker and awaits the response.


import { PythonCodeResultMessage, RunPythonCodeMessage, WorkerToSuperMessage} from "Message";

const WORKERPATH="./worker/workerbootstrap.js";

let verbose=false;

enum WorkerState{ IDLE, BUSY };

//if undefined is passed in, that indicates the worker was terminated before
//sending a response.
type ResponseCallback = (m: WorkerToSuperMessage|undefined) => void;

type WorkerStatusCallback = (isBusy: boolean) => void;
 

function receivedMessageFromWorker(ev: MessageEvent){
    WorkerManager.get().receivedMessageFromWorker(ev);
}

   
export class WorkerManager{

    private static instance: WorkerManager;

    worker: Worker;

    //functions to be called when we get a message from the worker
    //with a particular "in response to" flag.
    //If a worker is cancelled, the callbacks will be called with 
    //undefined as a parameter.
    callbacks: Map<number,ResponseCallback>;


    workerState = WorkerState.IDLE;

    //these are called when worker goes from idle to busy
    onBusyCallbacks: WorkerStatusCallback[] = [];

    //these are called when worker goes from busy to idle (or busy to terminated)
    onIdleCallbacks: WorkerStatusCallback[] = [];
    
    pendingPromises: any[] = [];

    private constructor(){
        this.callbacks = new Map();

        // @ts-ignore
        this.worker=undefined;
    }

    //f will be passed the boolean 'true'
    registerWorkerBusyCallback(f: WorkerStatusCallback ){
        this.onBusyCallbacks.push(f);
    }

    //f will be passed the boolean 'false'
    registerWorkerIdleCallback(f: WorkerStatusCallback ){
        this.onIdleCallbacks.push(f);
    }
    
    private setWorkerState(ws: WorkerState ){
        if( ws === this.workerState ){
            console.warn("setWorkerState: New state == old state");
            return;
        }
        this.workerState = ws;
        switch(ws){
            case WorkerState.IDLE:
                this.onIdleCallbacks.forEach( (f: WorkerStatusCallback) => {
                    f(false);
                });
                return;
            case WorkerState.BUSY:
                this.onBusyCallbacks.forEach( (f: WorkerStatusCallback) => {
                    f(true);
                });
                return;
            default:
                console.error("Bad worker state");
        }
    }
 
    isWorkerBusy(){
        return this.workerState === WorkerState.BUSY;
    }
    
    //This must be called before any other WorkerManager functions
    async initialize(): Promise<boolean> {
        if( this.worker === undefined ){
            return this.createWorker();
        } else {
            //worker already exists, so nothing to do
            let p = new Promise<boolean>( (resolveFunc, rejectFunc) => {
                resolveFunc(true);
            });
            return p;
        }
    }

    //forcibly terminate the worker
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


                //for any pending callbacks: Send them 'undefined'
                //to indicate the worker was terminated. Then
                //remove those callbacks from the list of 
                //ones that are waiting

                this.callbacks.forEach( (f: ResponseCallback) => {
                    f(undefined);   //tell callback the worker was terminated
                });
                this.callbacks.clear();

                //call any callbacks that need to be informed that we've gone from busy
                //to idle
                this.setWorkerState(WorkerState.IDLE);
                
                //create a new worker for later use
                return this.createWorker();
            } else {
                //worker is undefined, so we don't have a worker
                //to stop!
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

            //newly created worker is idle; we don't 
            //need to do any state transition callbacks, so we don't
            //call the setWorkerState function
            this.workerState = WorkerState.IDLE;

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

    runPythonAndComputeGeometry(code: string): Promise<PythonCodeResultMessage>{
        let p = new Promise<PythonCodeResultMessage>( (res,rej) => {

            this.setWorkerState( WorkerState.BUSY );

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
        
        //if wmsg is undefined, that means
        //that the worker was forcibly terminated
        //and this callback is being notified of that fact.
        //We don't reset the worker state here since that will be
        //handled elsewhere, in the code that did the termination.
        if( wmsg === undefined ){
            rej("Worker was cancelled");
            return;
        }

        let p = wmsg as PythonCodeResultMessage;

        //the worker has completed the computation, so it's now idle
        this.setWorkerState(WorkerState.IDLE);
        res(p);
    }
}