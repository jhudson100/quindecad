
//Controls clipping planes which allow the user to

import { ClippingPlane, View } from "View";
import { Slider } from "Slider";
import { makeCheckbox } from "utils";
 
//view inside the models
export class ClipControls{

    parent: HTMLElement;

    checkboxes: HTMLInputElement[] = [];
    minSliders: Slider[] = [];
    maxSliders: Slider[] = [];
    constructor(parent:HTMLElement){
        this.parent=parent;

        let axes=["x","y","z"];

        for(let i=0;i<3;++i){
            let div = document.createElement("div");
            parent.appendChild(div);
            this.checkboxes.push(  makeCheckbox(div,"Only draw "+axes[i]+" between",false) );
            this.minSliders.push( new Slider(div,0,-2,2,"10em") );
            div.appendChild( document.createTextNode(" and ") );
            this.maxSliders.push( new Slider(div,0,-2,2,"10em") );
        
            this.checkboxes[i].addEventListener("input", ()=>{
                this.setClippingPlanes();
            });

            this.minSliders[i].addListener( (v:number) => {
                if( this.maxSliders[i].value < v ){
                    this.maxSliders[i].setValue(v);
                }
                this.setClippingPlanes();
            });

            this.maxSliders[i].addListener( (v:number) => {
                if( this.minSliders[i].value > v ){
                    this.minSliders[i].setValue(v);
                }
                this.setClippingPlanes();
            });
        }

        View.get().registerMeshChangeListener( ()=>{
            let bbox = View.get().getBoundingBox();
            let mins = [bbox.min.x, bbox.min.y, bbox.min.z];
            let maxs = [bbox.max.x, bbox.max.y, bbox.max.z];
            for(let i=0;i<3;++i){
                this.minSliders[i].setRange(mins[i], maxs[i], true );
                this.maxSliders[i].setRange(mins[i], maxs[i], true );
            }
            this.setClippingPlanes();
        });
    }

    private setClippingPlanes(){
        let tmp = [];

        let planeEq = [ [1,0,0], [0,1,0], [0,0,1] ];
        
        for(let i=0;i<3;++i){
            if( this.checkboxes[i].checked ){
                tmp.push( new ClippingPlane(planeEq[i][0], planeEq[i][1], planeEq[i][2],-this.minSliders[i].value) );
                tmp.push( new ClippingPlane(-planeEq[i][0], -planeEq[i][1], -planeEq[i][2],this.maxSliders[i].value) );
                // tmp.push( new ClippingPlane(1,0,0,-this.minXslider.value) );
                // tmp.push( new ClippingPlane(-1,0,0,this.maxXslider.value) );
            }
        }

        View.get().setClippingPlanes(tmp);
    }

    resize(){
    }
}