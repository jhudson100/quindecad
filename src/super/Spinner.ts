import { spinner_svg } from "spinner_svg";


export class Spinner{

    parent: HTMLElement;
    elem: HTMLImageElement;
    visible=true;
    angle=0;

    constructor(parent: HTMLElement){
        this.elem = document.createElement("img");
        this.elem.src = spinner_svg;
        this.elem.style.width="1em";
        this.elem.style.height="1em";
        this.elem.style.visibility="hidden";
        this.parent=parent;
        this.parent.appendChild(this.elem);
    }

    show(){
        this.visible=true;
        this.elem.style.visibility="visible";

        let periodic = () => {
            this.angle += 5;
            if(this.angle > 360 )
                this.angle -= 360;
            this.elem.style.transform = `rotate(${this.angle}deg)`
            if( this.visible )
                setTimeout( periodic, 60 );
        };
        periodic();
    }
    hide(){
        this.visible=false;
        this.elem.style.visibility="hidden";
    }

}