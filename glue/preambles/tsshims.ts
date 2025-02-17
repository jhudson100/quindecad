import {Manifold, ManifoldToplevel, Mat4, Vec2, Vec3} from "../ext/manifold/manifold.js";
import { ManifoldMeshWrapper, MeshHandle, manifoldMeshes, handleToWrapper } from "./workertypes.js";
let manifold: ManifoldToplevel;

export function setManifold(m: ManifoldToplevel){
    manifold=m;
}
type ColorTripleQuadrupleOrString = [number,number,number,number?]|string;
type ColorQuadruple = [number,number,number,number];

type TransformFunction = (m: Manifold) => Manifold;

function transformAroundCentroid(centroid: Vec3|undefined, obj: ManifoldMeshWrapper, callback: TransformFunction)
{
    let cx: number;
    let cy: number;
    let cz: number;
    if( centroid === undefined ){
        //transform object around its own centroid
        let bbox = obj.mesh.boundingBox();
        cx = 0.5*( bbox.min[0] + bbox.max[0] );
        cy = 0.5*( bbox.min[1] + bbox.max[1] );
        cz = 0.5*( bbox.min[2] + bbox.max[2] );
    } else {
        cx = centroid[0];
        cy = centroid[1];
        cz = centroid[2];
    }

    if( cx === 0.0 && cy === 0.0 && cz === 0.0 ){
        //fast path
        let ob = callback( obj.mesh );
        return ob;
    } else {
        let o2 = obj.mesh.translate([-cx,-cy,-cz]);
        let o3 = callback( o2 );
        o2.delete();
        let o4 = o3.translate([cx,cy,cz]);
        o3.delete();
        return o4;
    }
}


function computeRotationMatrix(x:number,y:number,z:number,angle:number){
    angle = angle / 180 * Math.PI;
    let c = Math.cos(angle);
    let c1 = 1-c;
    let s = Math.sin(angle);
    //this is in COLUMN major order!
    //ref: https://en.wikipedia.org/wiki/Rotation_matrix
    //ref: https://ai.stackexchange.com/questions/14041/how-can-i-derive-the-rotation-matrix-from-the-axis-angle-rotation-vector
    let M: Mat4 = [
        x*x*c1+c,
        x*y*c1+z*s,
        x*z*c1-y*s,
        0,

        y*x*c1-z*s,
        y*y*c1+c,
        y*z*c1+x*s,
        0,

        x*z*c1+y*s,
        y*z*c1-x*s,
        z*z*c1+c,
        0,

        0,0,0,1
    ]
    return M;
}

type ColorDict = { [name:string]:ColorQuadruple };
const namedColors: ColorDict = {
    "red":      [255,   0,      0,      255],
    "orange":   [255,   128,    0,      255],
    "yellow":   [255,   255,    0,      255],
    "green":    [0,     128,    0,      255],
    "blue":     [0,     0,      255,    255],
    "purple":   [128,   0,      255,    255],
    "white":    [255,   255,    255,    255],
    "black":    [0,     0,      0,      255],
    "grey":     [128,   128,    128,    255],
    "gray":     [128,   128,    128,    255]
};

//ref: https://stackoverflow.com/questions/26414770/getting-the-rgb-values-for-a-css-html-named-color-in-javascript
const helperCanvas = document.createElement("canvas");
helperCanvas.width=1; helperCanvas.height=1;
const helperContext:CanvasRenderingContext2D = helperCanvas.getContext("2d") as CanvasRenderingContext2D;

function convertColorToQuadruple(color: ColorTripleQuadrupleOrString): ColorQuadruple|undefined
{
    if( color === undefined )
        return undefined;
    if( typeof(color) === "string"){
        let cs = color as string;
        if( namedColors[cs] ){
            return namedColors[cs];
        }
        helperContext.fillStyle = cs;
        helperContext.fillRect(0,0,1,1);
        let idata = helperContext.getImageData(0,0,1,1);
        return [ idata.data[0], idata.data[1], idata.data[2], idata.data[3] ];
    }
    let c = color as [number,number,number,number?];
    let tmp = [c[0],c[1],c[2],255];
    if( c.length > 3 )
        tmp[3] = c[3] as number;
    return tmp as ColorQuadruple;
}