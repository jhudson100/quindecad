import Module, { Manifold,ManifoldToplevel } from "../../ext/manifold/manifold.js";
import { TreeNode } from "../TreeNode.js";

let manifoldTopLevel: ManifoldToplevel;

export function setManifoldToplevel(m: ManifoldToplevel){
    manifoldTopLevel=m;
}

export function getManifoldToplevel(){
    return manifoldTopLevel;
}

export async function GeometricObjectInitialize(){
    const manifoldModule = await Module();
    manifoldModule.setup();
    manifoldTopLevel=manifoldModule;
}

let counter=0;

export class GeometricObject{

    //this is a unique identifer for the GeometricObject;
    //every GeometricObject gets a different unique number.
    unique: number;


    selected: boolean = false;

    //this is not set or managed by the GeometricObject at all;
    //the View handles this
    threeJsObject: any;

    //this is not set or managed by the GeometricObject at all;
    //the TreeView handles this
    treeNode: TreeNode;

    name: string;
    iconName: string;

    //raw geometric data; we don't use indices since
    //we want faceted (non-smooth) renderings
    vertices: Float32Array;
    
    //iconName = "cube", "cylinder", etc.
    constructor(name: string, iconName: string){
        this.unique = counter++;
        this.name=name;
        this.iconName=iconName;
    }


    manifoldToTriangles(ma: Manifold) {
        let m = ma.getMesh();
            
        //stores x,y,z,x,y,z,...
        let positions: Float32Array = m.vertProperties;

        //stores indices for triangles
        let indices = m.triVerts;
        
        this.vertices = new Float32Array(indices.length*3);
        for(let i=0,j=0;i<indices.length;++i){
            let vi = indices[i];
            if( vi === undefined )
                throw new Error("Internal error: No vertex index for mesh");
            vi *= 3;
            let x = positions[vi++];
            let y = positions[vi++];
            let z = positions[vi++];
            if( x === undefined )
                throw new Error("Internal error: No x coordinate for mesh");
            if( y === undefined )
                throw new Error("Internal error: No y coordinate for mesh");
            if( z === undefined )
                throw new Error("Internal error: No z coordinate for mesh");
            
            this.vertices[j++] = x;
            this.vertices[j++] = y;
            this.vertices[j++] = z;
        }
    }

}