import { Mesh } from "Mesh";
import { View } from "View";
import { ArgSpec, FuncSpec, getPreambleFunctionInfo } from "pyshimdoc";
import { Dialog } from "Dialog";

export function saveSTL(){
    let meshes = View.get().getMeshes();

    if(!meshes || meshes.length == 0){
        let d = new Dialog( [ 
            {
                name: "OK", 
                callback: () => { d.hide(); } 
            }
        ]);
        d.contentArea.innerHTML = "There are no meshes to save";
        d.show();
        return;
    }

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

export function getFunctionSignatureDocumentation(fs:FuncSpec, includeTypes: boolean, includeDefaultValues: boolean){
    let toplevel = document.createElement("span");   
    toplevel.className = "functionsignature";
    
    let funcname = document.createElement("span");
    toplevel.appendChild(funcname);
    funcname.className="functionname";
    funcname.appendChild(document.createTextNode(fs.name));
    
    toplevel.appendChild(document.createTextNode("("));

    fs.args.forEach( (a: ArgSpec, idx: number ) => {
        let sp = document.createElement("span");

        let argname = document.createElement("span");
        sp.appendChild(argname);
        argname.className="argname";
        argname.appendChild( document.createTextNode(a.argname) );

        if( includeTypes ){
            if( a.argtypes ){
                let argtype = document.createElement("span");
                sp.appendChild(argtype);
                argtype.className="argtype";
                argtype.appendChild( document.createTextNode(": ") );
                let tmp = a.argtypes.join("|");
                argtype.appendChild( document.createTextNode(tmp));
            }
        }
        if(includeDefaultValues && a.defaultValue){
            let defval = document.createElement("span");
            sp.appendChild(defval);
            defval.className = "defaultvalue";
            defval.appendChild( document.createTextNode( "=" + a.defaultValue ) );
        }
         
        if( idx !== 0 ){
            toplevel.appendChild( document.createTextNode(", ") );
        }
        toplevel.appendChild(sp);
    });
    toplevel.appendChild(document.createTextNode(")"));
    return toplevel;
}


export function getDetailedFunctionDocumentation(fs: FuncSpec, includeFunctionDoc: boolean)
{
    let elem = document.createElement("div");

    if( includeFunctionDoc ){
        let fdocdiv = document.createElement("div");
        elem.appendChild(fdocdiv);
        fdocdiv.className = "functiondocstring";
        fdocdiv.appendChild( document.createTextNode( fs.doc ) );
    }
    
    let ul = document.createElement("ul");
    elem.appendChild(ul);

    fs.args.forEach( (a: ArgSpec ) => {
        let explanations = a.argtypesVerbose;
        
        let li = document.createElement("li");
        ul.appendChild(li);

        let span = document.createElement("span");
        li.appendChild(span);
        span.className="argname";
        span.appendChild(document.createTextNode(a.argname));
        
        li.appendChild(document.createTextNode(" is "));

        span = document.createElement("span");
        li.appendChild(span);
        span.className = "argtype";
        span.appendChild( document.createTextNode( explanations.join(" or ") ) );

        if( a.doc){
            let ul2 = document.createElement("ul");
            li.appendChild(ul2);
            let li2 = document.createElement("li");
            ul2.appendChild(li2);
            li2.appendChild(document.createTextNode(a.doc));
        }
    });

    return elem;
}


export function 
showHelp(){
    fetch("help.html").then( (resp: Response) => {
        if(resp.ok){
            resp.text().then( (txt: string) => {

                let ul = document.createElement("ul");

                let M: Map<string,FuncSpec> = getPreambleFunctionInfo();
                M.forEach( (fs: FuncSpec) => {
                    let li = document.createElement("li");
                    li.className = "functiondoc";
                    ul.appendChild(li);
                    li.appendChild(getFunctionSignatureDocumentation(fs,false,true));
                    li.appendChild(getDetailedFunctionDocumentation(fs,true));
                });

                txt = txt.replace("<!--FUNCTIONS-->",ul.innerHTML);

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

export function showAboutDialog(){
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
}


let unique=0;
export function makeCheckbox(container:HTMLElement, label: string, checked: boolean){
    let inp : HTMLInputElement = document.createElement("input");
    inp.type="checkbox";
    inp.checked = checked;
    inp.id="checkbox"+(unique++);
    let lbl: HTMLLabelElement = document.createElement("label");
    lbl.style.userSelect="none";
    lbl.htmlFor=inp.id;
    lbl.appendChild(document.createTextNode(label));
    container.appendChild(inp);
    container.appendChild(lbl);
    return inp;
}