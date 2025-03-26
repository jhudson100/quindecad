import { Point3 } from "../Point3.js";
import { GeometricObject, getManifoldToplevel } from "./GeometricObject.js";

export class Box extends GeometricObject {
    centroid: Point3;
    xsize: number;
    ysize: number;
    zsize: number;

    constructor(name:string, centroid: Point3, xsize: number, ysize: number, zsize: number){
        super(name,"box");
        this.centroid=centroid;
        this.xsize=xsize;
        this.ysize=ysize;
        this.zsize=zsize;
        let ma = getManifoldToplevel().Manifold.cube([xsize,ysize,zsize],true);
        let ma2 = ma.translate([this.centroid.x,this.centroid.y,this.centroid.z]);
        this.manifoldToTriangles(ma2);
        ma2.delete();
        ma.delete();
    }
}

