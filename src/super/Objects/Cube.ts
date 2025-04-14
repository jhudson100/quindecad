import { Point3 } from "../Point3.js";
import { GeometricObject, getManifoldToplevel } from "./GeometricObject.js";

export class Box extends GeometricObject {
    xsize: number;
    ysize: number;
    zsize: number;

    constructor(name:string, xsize: number, ysize: number, zsize: number){
        super(name,"box");
        this.xsize=xsize;
        this.ysize=ysize;
        this.zsize=zsize;
        let ma = getManifoldToplevel().Manifold.cube([xsize,ysize,zsize],true);
        this.manifoldToTriangles(ma);
        ma.delete();
    }
}

