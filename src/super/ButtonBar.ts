/*
import {View} from "View";
import {PythonManager} from "PythonManager";
import {Mesh} from "../common/Mesh";
import { Dialog } from "Dialog";
import { WorkerManager } from "WorkerManager";
import { Spinner } from "Spinner";
import { ArgSpec, FuncSpec, getPreambleFunctionInfo } from "pyshimdoc";
import { getDetailedFunctionDocumentation, getFunctionSignatureDocumentation, saveSTL, showAboutDialog, showHelp } from "utils";

type ButtonCallback = ()=>void;


export class ButtonBar{
    private static instance: ButtonBar;
    // parent: HTMLElement;
    saveButton: HTMLButtonElement;
    runButton: HTMLButtonElement;
    aboutButton: HTMLButtonElement;
    stopButton: HTMLButtonElement;
    helpButton: HTMLButtonElement;
    spinner: Spinner;

    private constructor(){
    }

    static get() {
        if(!ButtonBar.instance)
            ButtonBar.instance = new ButtonBar();
        return ButtonBar.instance;
    }

    makeButton(parent: HTMLElement, label: string, callback: ButtonCallback){
        let b = document.createElement("button");
        b.style.marginLeft="0.5em";
        b.style.marginRight="0.5em";
        b.appendChild(document.createTextNode(label));
        b.addEventListener("click",callback);
        parent.appendChild(b);
        return b;
    }

    initialize(parent:HTMLElement){
        let div = document.createElement("div");
        parent.appendChild(div);
        div.style.background="rgba(0,0,0,0.5)";
        div.style.border="0.1em solid black";
        // div.style.margin="0.2em";
        // div.style.padding="0.2em";

        this.saveButton = this.makeButton(div, "Save STL", ()=>{
            saveSTL();
        });
        
        this.runButton = this.makeButton( div, "Run Python", () => {
            PythonManager.get().runCodeFromEditor();
        });

        this.aboutButton = this.makeButton( div, "About", ()=>{
            showAboutDialog();
        });

        this.helpButton = this.makeButton( div, "Help", ()=>{
            showHelp();
        });

        this.stopButton = this.makeButton( div, "Stop", () => {
            WorkerManager.get().stopWorker();

        })
        this.stopButton.disabled=true;

        let sdiv = document.createElement("div");
        div.appendChild(sdiv);
        sdiv.style.display="inline-block";
        this.spinner = new Spinner(sdiv);

        WorkerManager.get().registerWorkerBusyCallback( () => {
            this.saveButton.disabled=true;
            this.runButton.disabled=true;
            this.stopButton.disabled=false;
            this.spinner.show();
        });
        WorkerManager.get().registerWorkerIdleCallback( () => {
            this.saveButton.disabled=false;
            this.runButton.disabled=false;
            this.stopButton.disabled=true;
            this.spinner.hide();
        });

    }
}
 */