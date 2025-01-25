import { FuncSpec, getPreambleFunctionInfo } from "pyshimdoc";
import { getDetailedFunctionDocumentation, getFunctionSignatureDocumentation } from "utils";

export class HelpInfo{
    parent:HTMLElement;
    seldiv: HTMLElement;
    contentdiv: HTMLElement;

    constructor(parent: HTMLElement){
        this.parent=parent;
        let overalldiv = document.createElement("div");
        parent.appendChild(overalldiv);


        this.seldiv = document.createElement("div");
        overalldiv.appendChild(this.seldiv);
        let sel = document.createElement("select");
        this.seldiv.appendChild(sel);

        this.contentdiv = document.createElement("div");
        this.contentdiv.classList.add("helpInfo");
        overalldiv.appendChild(this.contentdiv);
        this.contentdiv.style.overflow="auto";

        let op = document.createElement("option");
        op.appendChild( document.createTextNode( "Get documentation...") );
        sel.appendChild(op);

        let docs: HTMLElement[] = [];
        getPreambleFunctionInfo().forEach( (fspec: FuncSpec) => {
            let op = document.createElement("option");
            sel.appendChild(op);
            op.appendChild(document.createTextNode( fspec.name ) );
            
            let d = getFunctionSignatureDocumentation(fspec,false,true) 

            let div = document.createElement("div");
            div.appendChild(d);

            let dd = getDetailedFunctionDocumentation(fspec,true);
            div.appendChild(dd);

            docs.push( div );
        });

        let firstTime=true;
        sel.addEventListener("change", () => {
            let idx = sel.selectedIndex;
            if( firstTime ){
                if( sel.selectedIndex === 0 )
                    return;
                firstTime=false;
                sel.removeChild(sel.firstChild);
                idx--;
                sel.selectedIndex = idx;
            }
            while( this.contentdiv.childNodes.length > 0 ){
                this.contentdiv.removeChild(this.contentdiv.firstChild);
            } 
            this.contentdiv.appendChild( docs[ idx ] );
        });

    }

    resize(){
        let pr = this.parent.getBoundingClientRect();
        let sr = this.seldiv.getBoundingClientRect();
        this.contentdiv.style.width = pr.width+"px";
        let rh = pr.height - sr.height;
        if( rh <= 0 )
            this.contentdiv.style.height = "0px";
        else
            this.contentdiv.style.height = rh+"px";
    }
}
