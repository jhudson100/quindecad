import { Point3 } from "../Point3.js";
import { GeometricObject, getManifoldToplevel } from "./GeometricObject.js";

export class Cylinder extends GeometricObject {
    centroid: Point3;
    radius: number;
    height: number;
    resolution: number = 36;
    constructor(name:string, centroid: Point3, radius: number, height: number){
        super(name,"cylinder");
        this.centroid=centroid;
        this.radius=radius;
        this.height=height;
        let ma = getManifoldToplevel().Manifold.cylinder(height,radius,radius,this.resolution,true);
        let ma2 = ma.translate([this.centroid.x,this.centroid.y,this.centroid.z]);
        this.manifoldToTriangles(ma2);
        ma2.delete();
        ma.delete();
    }
}

