import {View} from "View";
import {PythonManager} from "PythonManager";
import {Mesh} from "../common/Mesh";
import { Dialog } from "Dialog";
import { WorkerManager } from "WorkerManager";
import { Spinner } from "Spinner";
import { ArgSpec, FuncSpec, getPreambleFunctionInfo } from "pyshimdoc";

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
        div.style.margin="0.2em";
        div.style.padding="0.2em";

        this.saveButton = this.makeButton(div, "Save STL", ()=>{
            this.saveSTL();
        });
        
        this.runButton = this.makeButton( div, "Run Python", () => {
            PythonManager.get().runCodeFromEditor();
        });

        this.aboutButton = this.makeButton( div, "About", ()=>{
            this.showAboutDialog();
        });

        this.helpButton = this.makeButton( div, "Help", ()=>{
            this.showHelp();
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


    saveSTL(){
        let meshes = View.get().getMeshes();

        if(!meshes || meshes.length == 0)
            return;

        let totalTriangles=0;
        meshes.forEach( (m: Mesh) => {
            //3 components per vertex
            let numComponents = m.vertices.length;
            let numVerts = numComponents/3;
            let numTris = numVerts/3;
            totalTriangles += numTris;
        });

        let A = new ArrayBuffer( 80+4+totalTriangles*50 );
        let D = new DataView(A);

        //offset    size    content
        //0         80      comment
        //80        4       u32 num triangles
        //84        50*nt  triangle data
        //Each triangle has 50 bytes:
        // nx,ny,nz (float32)
        // x,y,z (p0, float32)
        // x,y,z (p1, float32)
        // x,y,z (p2, float32)
        // zero (u16)

        let comment = "STL "+(new Date().toString());
        for(let i=0;i<comment.length;++i){
            D.setUint8( i, comment.charCodeAt(i) );
        }
        D.setUint32( 80, totalTriangles, true );
        let offset = 84;

        console.log(meshes);

        let eachTime;

        meshes.forEach( (m: Mesh) => {
            let numVerts = m.vertices.length/3; //x,y,z for each vertex
            let numTris = numVerts/3;   //3 vertices per triangle
            let k=0;
            for(let i=0;i<numTris;++i){
                let before = offset;
                D.setFloat32(offset, 0, true);      //nx
                offset += 4;
                D.setFloat32(offset, 0, true);      //ny
                offset += 4;
                D.setFloat32(offset, 0, true);      //nz
                offset += 4;
                for(let vertexNumber=0;vertexNumber<3;++vertexNumber){  //p0, p1, p2

                    for(let j=0;j<3;++j){           //x,y,z
                        let val = m.vertices[k++];
                        D.setFloat32(offset, val*0.001, true); 
                        offset += 4;
                    }
                }
                D.setUint16(offset,0,true); 
                offset += 2;
                let after=offset;
                eachTime = after-before
            }
        });

        //ref:https://stackoverflow.com/a/33542499
        let b = new Blob([A], {type: "model/stl"});
        let e = document.createElement("a");
        let u = URL.createObjectURL(b);
        e.href=u;
        e.download="model.stl";
        e.style.display="none";
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);

        //free up memory after 180 seconds
        setTimeout( ()=>{
            URL.revokeObjectURL(u);
        }, 180 * 1000 );
    }

    showAboutDialog(){
        fetch("about.txt").then( (resp: Response) => {
            if(resp.ok){
                resp.text().then( (txt: string) => {
                    let d = new Dialog( [
                        { "name": "OK" }
                    ]);
                    let div = document.createElement("div");
                    div.style.overflow="scroll";
                    div.style.height="50vh";
                    div.style.textAlign="left";
                    div.style.whiteSpace="pre";
                    div.appendChild(document.createTextNode(txt));
                    d.contentArea.appendChild(div);
                    d.show();
                });
            }
        });

        // let d = new Dialog( [
        //     { "name": "OK" }
        // ]);
        // let div = document.createElement("div");
        // div.style.overflow="scroll";
        // div.style.height="50vh";
        // div.style.textAlign="left";
        // div.style.whiteSpace="pre";

        // div.appendChild(document.createTextNode(externalLibraries));
        // d.contentArea.appendChild(div);
        // d.show();
    }

    showHelp(){
        fetch("help.html").then( (resp: Response) => {
            if(resp.ok){
                resp.text().then( (txt: string) => {

                    let L: string[] = [];

                    L.push("<ul>");

                    let M: Map<string,FuncSpec> = getPreambleFunctionInfo();
                    M.forEach( (fs: FuncSpec) => {
                        let funcname = fs.name;
                        let eacharg: string[] = [];
                        let args : ArgSpec[] = fs.args;
                        args.forEach( (a: ArgSpec ) => {
                            let tmp = `<span class="argname">${a.argname}</span>`;
                            if(a.defaultValue){
                                tmp += ` <span class="defaultvalue">= ${a.defaultValue}</span>`;
                            }
                            eacharg.push(tmp);
                        });
                        let tmp = `<div class='functionsignature'><li><span class='functionname'>${funcname}</span>(${eacharg.join(" , ")})</div>`;
                        L.push(tmp);

                        L.push("<div class='functiondocstring'>");
                        L.push( fs.doc );
                        L.push("</div>");
                        
                        L.push("<ul>");
                        args.forEach( (a: ArgSpec ) => {
                            let explanations = a.argtypesVerbose;
                            L.push(`<li><span class="argname">${a.argname}</span> is <span class="argtype">${explanations.join(" or ")}</span></li>`)
                            if( a.doc){
                                L.push(`<ul><li>${a.doc}</li></ul>`);
                            }
                        });
                        L.push("</ul>");
                    });

                    L.push("</ul>");

                    txt = txt.replace("<!--FUNCTIONS-->",L.join("\n"));

                    let d = new Dialog( [
                        { "name": "OK" }
                    ]);
                    let div = document.createElement("div");
                    div.style.overflow="scroll";
                    div.style.height="50vh";
                    div.style.textAlign="left";
                    // div.style.whiteSpace="pre-wrap";
                    div.innerHTML=txt;
                    // div.appendChild(document.createTextNode(txt));
                    d.contentArea.appendChild(div);
                    d.show();
                });
            }
        });
    }
}
 