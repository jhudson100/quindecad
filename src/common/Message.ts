
//need to use full path since we import from worker script too
//and we can't use a source map there
import {DrawCommand} from "/dist/common/DrawCommand.js";
import {Mesh} from "/dist/common/Mesh.js";

export enum MessageType{
    ARE_YOU_READY="ARE_YOU_READY", 
    I_AM_READY="I_AM_READY", 
    RUN_PYTHON_CODE="RUN_PYTHON_CODE", 
    PYTHON_CODE_RESULT="PYTHON_CODE_RESULT",
    COMPUTE_GEOMETRY="COMPUTE_GEOMETRY",
    GEOMETRY_COMPUTED="GEOMETRY_COMPUTED"
};

export abstract class Message{
    type: MessageType;
    constructor(type: MessageType){
        this.type=type;
    }
}


export abstract class SuperToWorkerMessage extends Message{
    static counter:number = 0;
    unique: number;
    constructor(type: MessageType){
        super(type);
        this.unique = SuperToWorkerMessage.counter++;
    }
}

export abstract class WorkerToSuperMessage extends Message{
    inResponseTo: number;
    constructor(type: MessageType, inResponseTo: number){
        super(type);
        this.inResponseTo=inResponseTo;
    }
}

export class IsReadyMessage extends SuperToWorkerMessage {
    constructor(){
        super(MessageType.ARE_YOU_READY);
    }
}

export class IAmReadyMessage extends WorkerToSuperMessage {
    constructor(inResponseTo: number){
        super(MessageType.I_AM_READY,inResponseTo);
    }
}


export class RunPythonCodeMessage extends SuperToWorkerMessage{
    code: string;
    constructor(code: string){
        super(MessageType.RUN_PYTHON_CODE);
        this.code=code;
    }
}


export class PythonCodeResultMessage extends WorkerToSuperMessage{
    commands: DrawCommand[];
    printables: string[];
    errorLineNumbers: number[];
    errorPositions: number[][];
    errorMessages: string[];
    constructor(inResponseTo: number, result: any[],
            printables: string[],
            errorLineNumbers: number[], errorPositions: number[][],
            errorMessages: string[]
    ){
        super(MessageType.PYTHON_CODE_RESULT,inResponseTo);
        this.commands=result;
        this.printables = printables;
        this.errorLineNumbers = errorLineNumbers;
        this.errorPositions = errorPositions;
        this.errorMessages = errorMessages;
    }
}


export class ComputeGeometryMessage extends SuperToWorkerMessage{
    commands: DrawCommand[];
    constructor(commands: DrawCommand[]){
        super(MessageType.COMPUTE_GEOMETRY);
        this.commands=commands;
    }
}

export class GeometryComputedMessage extends WorkerToSuperMessage{
    meshes: Mesh[];
    error:string|undefined;
    constructor(inResponseTo: number, meshes: Mesh[], error: string|undefined){
        super(MessageType.GEOMETRY_COMPUTED, inResponseTo);
        this.meshes=meshes;
        this.error=error;
    }
}
