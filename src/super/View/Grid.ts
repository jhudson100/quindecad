import { Group } from "../ThreeTypes";


// @ts-ignore
import * as THREE from "three";

// @ts-ignore
import {LineSegmentsGeometry} from "LineSegmentsGeometry";

// @ts-ignore
import {LineSegments2} from "LineSegments2";

// @ts-ignore
import {LineMaterial} from "LineMaterial";

export class Grid{
    grid: Group;
    majorColor: number;
    majorWidth: number;
    majorInterval: number;
    minorColor: number;
    minorWidth: number;
    minorSpacing: number;
    gridExtent: number;
    plane: GridPlane

    constructor( majorColor:number, majorWidth:number, majorInterval:number,
                minorColor:number, minorWidth:number, minorDistance:number,
                gridExtent:number, gridType:GridPlane) {
        
        let majorMtl:any = new LineMaterial({color:majorColor, linewidth: majorWidth});
        let minorMtl:any = new LineMaterial({color:minorColor, linewidth: minorWidth});
        let majorLines: number[] = [];
        let minorLines: number[] = [];
        for(let i=-gridExtent,j=0;i<=gridExtent;i+=minorDistance,j++){
            let idx: number;
            let L: any[];
            if( j === majorInterval ){
                j=0;
                L=majorLines;
            } else {
                L=minorLines;
            }

            switch(gridType){
                case GridPlane.XY:
                    L.push(i);              L.push(-gridExtent); L.push(0);
                    L.push(i);              L.push( gridExtent); L.push(0);
                    L.push(-gridExtent);    L.push(i);           L.push(0);
                    L.push( gridExtent);    L.push(i);           L.push(0);
                    break;
                case GridPlane.YZ:
                    L.push(0);    L.push(i);            L.push(-gridExtent);
                    L.push(0);    L.push(i);            L.push(gridExtent);
                    L.push(0);    L.push(-gridExtent);  L.push(i);
                    L.push(0);    L.push(gridExtent);   L.push(i);
                    break;
                case GridPlane.XZ:
                    L.push(i);              L.push(0);  L.push(-gridExtent);
                    L.push(i);              L.push(0);  L.push(gridExtent);
                    L.push(-gridExtent);    L.push(0);  L.push(i);
                    L.push( gridExtent);    L.push(0);  L.push(i);
                    break;
                default:
                    throw new Error();
            }
        }
        let grp = new THREE.Group();
        grp.name = "grid";
        

        let geo = new LineSegmentsGeometry();
        geo.setPositions(majorLines);
        let m = new LineSegments2(geo,majorMtl);
        grp.add(m);

        geo = new LineSegmentsGeometry();
        geo.setPositions(minorLines);
        m = new LineSegments2(geo,minorMtl);
        grp.add(m);

        // grp.userData = new UserData(false);
        this.grid=grp;
    }

    removeFromParent(){
        this.grid.removeFromParent();
    }

    addToScene( scene: any){
        scene.add(this.grid);
    }
}

export enum GridPlane {
    XZ, YZ, XY
}
