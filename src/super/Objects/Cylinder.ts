import { Point3 } from "../Point3.js";
import { GeometricObject, getManifoldToplevel } from "./GeometricObject.js";

export class Cylinder extends GeometricObject {
    radius: number;
    height: number;
    resolution: number = 36;
    constructor(name:string, radius: number, height: number){
        super(name,"cylinder");
        this.radius=radius;
        this.height=height;
        let ma = getManifoldToplevel().Manifold.cylinder(height,radius,radius,this.resolution,true);
        this.manifoldToTriangles(ma);
        ma.delete();
    }
}

