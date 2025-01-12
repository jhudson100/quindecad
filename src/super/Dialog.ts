
type ButtonCallback = () => void;

interface ButtonSpec{
    name: string;
    callback? : ButtonCallback;
}


export class Dialog{

    darkOverlay: HTMLElement;
    contentArea: HTMLElement;
    
    constructor( buttons: ButtonSpec[] ){
        this.darkOverlay = document.createElement("div");
        this.darkOverlay.style.zIndex="10";
        this.darkOverlay.style.overflow="hidden";
        this.darkOverlay.style.position="absolute";
        this.darkOverlay.style.left="0px";
        this.darkOverlay.style.right="0px";
        this.darkOverlay.style.top="0px";
        this.darkOverlay.style.bottom="0px";
        this.darkOverlay.style.background="rgba(0,0,0,0.5)";
        this.darkOverlay.style.textAlign="center";

        let opaqueArea = document.createElement("div");
        this.darkOverlay.appendChild(opaqueArea);
        opaqueArea.style.background="white";
        opaqueArea.style.margin="auto auto";
        opaqueArea.style.display="inline-block";

        //ref: https://stackoverflow.com/questions/396145/how-can-i-vertically-center-a-div-element-for-all-browsers-using-css
        opaqueArea.style.position="relative";
        opaqueArea.style.top="50%";
        opaqueArea.style.transform="translateY(-50%)";
        opaqueArea.style.borderWidth="0.25em";
        //dotted, dashed, solid, double, groove, ridge, inset, outset
        opaqueArea.style.borderStyle="double";
        opaqueArea.style.borderColor="black";
        opaqueArea.style.padding="1em";

        this.contentArea = document.createElement("div");
        let buttonBar = document.createElement("div");

        opaqueArea.appendChild(this.contentArea);
        opaqueArea.appendChild(document.createElement("hr"));
        opaqueArea.appendChild(buttonBar);

        buttons.forEach( (spec: ButtonSpec) => {
            let b = document.createElement("button");
            b.style.marginLeft="0.5em";
            b.style.marginRight="0.5em";
            
            b.appendChild(document.createTextNode(spec.name) );
            let callback: ButtonCallback = spec.callback;
            if(!callback)
                callback = ()=>{ this.hide(); };

            b.addEventListener("click", callback);
            buttonBar.appendChild(b);
        });

        //testing
        // this.contentArea.innerHTML="FOO<br>BAR";
    }

    show(){
        document.body.appendChild(this.darkOverlay);
    }

    hide(){
        document.body.removeChild(this.darkOverlay);
    }
}