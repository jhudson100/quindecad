

//This file is autogenerated. Do not edit.


import {Manifold, ManifoldToplevel, Mat4, Vec2, Vec3} from "../ext/manifold/manifold.js";
import { ManifoldMeshWrapper, MeshHandle, manifoldMeshes, handleToWrapper } from "./workertypes.js";
let manifold: ManifoldToplevel;

export function setManifold(m: ManifoldToplevel){
    manifold=m;
}
type PyColor = [number,number,number,number?];
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

type boundingbox_t = ( objects : MeshHandle|MeshHandle[] ) => Vec3[] ;
declare global {
    interface WorkerGlobalScope { impl_boundingbox : boundingbox_t }
};

self.impl_boundingbox = ( objects : MeshHandle|MeshHandle[] ) : Vec3[] => {

    if(!objects.hasOwnProperty("length") ){
        let mw = handleToWrapper( objects as MeshHandle );
        let bb = mw.mesh.boundingBox();
        return [ bb.min, bb.max ];
    } else {
        let L = objects as MeshHandle[];
        let objs: MeshHandle[] = [];
        let mw = handleToWrapper( L[0] );
        let tmp = mw.mesh.boundingBox();
        let minimum = tmp.min;
        let maximum = tmp.max;
        for(let i=1;i<objs.length;++i){
            mw = handleToWrapper( L[i] );
            let box = mw.mesh.boundingBox();
            for(let i=0;i<3;++i){
                if( box.min[i] < minimum[i] )
                    minimum[i] = box.min[i];
                if( box.max[i] > maximum[i] )
                    maximum[i] = box.max[i];
            }
        }
        return [ minimum, maximum ];
    }

}
type box_t = ( min : Vec3,max : Vec3,color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_box : box_t }
};

self.impl_box = ( min : Vec3,max : Vec3,color : PyColor,name : string ) : MeshHandle => {

    let xsize = max[0]-min[0];
    let ysize = max[1]-min[1];
    let zsize = max[2]-min[2];
    if( xsize<=0 )
        throw new Error("box(): max x <= min x");
    if( ysize<=0 )
        throw new Error("box(): max y <= min y");
    if( zsize<=0 )
        throw new Error("box(): max z <= min z");

    let c = manifold.Manifold.cube(
        [xsize, ysize, zsize],
        false
    );
    let c2 = c.translate(min);
    c.delete()
    return new MeshHandle( new ManifoldMeshWrapper(c2,color,name) );

}
type cube_t = ( xsize : number,ysize : number,zsize : number,x : number,y : number,z : number,centered : boolean,color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_cube : cube_t }
};

self.impl_cube = ( xsize : number,ysize : number,zsize : number,x : number,y : number,z : number,centered : boolean,color : PyColor,name : string ) : MeshHandle => {

    let c = manifold.Manifold.cube(
        [xsize, ysize, zsize],
        centered
    );
    let c2 = c.translate([x,y,z]);
    c.delete()
    return new MeshHandle( new ManifoldMeshWrapper(c2,color,name) );

}
type cut_t = ( object : MeshHandle,planeNormal : Vec3,planeD : number,keepPositive : boolean,color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_cut : cut_t }
};

self.impl_cut = ( object : MeshHandle,planeNormal : Vec3,planeD : number,keepPositive : boolean,color : PyColor,name : string ) : MeshHandle => {

    let mw = handleToWrapper(object);
    let results = mw.mesh.splitByPlane( planeNormal, planeD);
    let ki = ( keepPositive ? 0 : 1 );
    results[1-ki].delete();
    return new MeshHandle( new ManifoldMeshWrapper( results[ki], color ?? mw.color,name ) );

}
type cylinder_t = ( x : number,y : number,z : number,radius : number,height : number,zcenter : boolean,color : PyColor,resolution : number,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_cylinder : cylinder_t }
};

self.impl_cylinder = ( x : number,y : number,z : number,radius : number,height : number,zcenter : boolean,color : PyColor,resolution : number,name : string ) : MeshHandle => {

    let c = manifold.Manifold.cylinder(height,
        radius, radius, resolution,
        zcenter
    );
    let c2 = c.translate([x, y, z]);
    c.delete();
    return new MeshHandle( new ManifoldMeshWrapper(c2,color,name) );

}
type difference_t = ( objects : MeshHandle[],color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_difference : difference_t }
};

self.impl_difference = ( objects : MeshHandle[],color : PyColor,name : string ) : MeshHandle => {

    if( objects.length === 1 )
        return objects[0];

    let mw1 = handleToWrapper(objects[0]);
    let mw2 = handleToWrapper(objects[1]);
    let ob = manifold.Manifold.difference( mw1.mesh, mw2.mesh );
    for(let i=2;i<objects.length;++i){
        mw2 = handleToWrapper(objects[i]);
        let ob2 = manifold.Manifold.difference( ob, mw2.mesh );
        ob.delete();
        ob=ob2;
    }
    return new MeshHandle( new ManifoldMeshWrapper(ob,color ?? mw1.color,name) );

}
type extrude_t = ( polygon : Vec2[],height : number,divisions : number,twist : number,scale : Vec2,zcenter : boolean,color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_extrude : extrude_t }
};

self.impl_extrude = ( polygon : Vec2[],height : number,divisions : number,twist : number,scale : Vec2,zcenter : boolean,color : PyColor,name : string ) : MeshHandle => {


    let poly: Vec2[] = [];
    for(let i=0;i<polygon.length;++i){
        poly.push( [polygon[i][0], polygon[i][1]] );
    }
    if( height === undefined )
        height = 1;
    if( divisions === undefined )
        divisions = 1;
    if( twist === undefined )
        twist = 0;
    if( scale === undefined )
        scale = [1,1]
    else
        scale = [ scale[0], scale[1] ]

    let o1 = manifold.Manifold.extrude(
            poly,
            height,
            divisions,
            twist,
            scale,
            zcenter
    );
    return new MeshHandle( new ManifoldMeshWrapper( o1, color ,name) );

}
type free_t = ( obj : MeshHandle ) => void ;
declare global {
    interface WorkerGlobalScope { impl_free : free_t }
};

self.impl_free = ( obj : MeshHandle ) : void => {

    let mw = handleToWrapper( obj );
    mw.mesh.delete();
    mw.freed=true;

}
type frustum_t = ( radius1 : number,radius2 : number,height : number,x : number,y : number,z : number,zcenter : boolean,color : PyColor,resolution : number,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_frustum : frustum_t }
};

self.impl_frustum = ( radius1 : number,radius2 : number,height : number,x : number,y : number,z : number,zcenter : boolean,color : PyColor,resolution : number,name : string ) : MeshHandle => {

    let c = manifold.Manifold.cylinder(height,
        radius1, radius2, resolution,
        zcenter
    );
    let c2 = c.translate([x, y, z]);
    c.delete();
    return new MeshHandle( new ManifoldMeshWrapper(c2,color,name) );

}
type hull_t = ( objects : MeshHandle|MeshHandle[],color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_hull : hull_t }
};

self.impl_hull = ( objects : MeshHandle|MeshHandle[],color : PyColor,name : string ) : MeshHandle => {


    if(!objects.hasOwnProperty("length") ){
        let mw = handleToWrapper( objects as MeshHandle );
        let o2 = mw.mesh.hull();
        return new MeshHandle( new ManifoldMeshWrapper( o2, color ?? mw.color, name ) );
    } else {
        let L = objects as MeshHandle[];
        if( L.length === 1 ){
            let mw = handleToWrapper( L[0] );
            let o2 = mw.mesh.hull();
            return new MeshHandle( new ManifoldMeshWrapper( o2, color ?? mw.color, name ) );
        } else {
            let mw = handleToWrapper(L[0]);
            let ob = mw.mesh;
            for(let i=1;i<L.length;++i){
                let ob2 = manifold.Manifold.union(
                    ob,
                    handleToWrapper( L[i] ).mesh
                );
                if( i !== 1 )
                    ob.delete();
                ob = ob2;
            }
            let ob3 = ob.hull();
            //at this point, we had at least two things in the list
            //so ob represents the result of a union operation,
            //and we must delete it.
            ob.delete();
            return new MeshHandle( new ManifoldMeshWrapper( ob3, color ?? mw.color,name ));
        }
    }

}
type intersection_t = ( objects : MeshHandle[],color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_intersection : intersection_t }
};

self.impl_intersection = ( objects : MeshHandle[],color : PyColor,name : string ) : MeshHandle => {

    if( objects.length === 1 )
        return objects[0];

    let mw1 = handleToWrapper(objects[0]);
    let mw2 = handleToWrapper(objects[1]);
    let ob = manifold.Manifold.intersection(
        mw1.mesh, mw2.mesh
    );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.intersection(
            ob,
            handleToWrapper(objects[i]).mesh
        );
        ob.delete();
        ob=ob2;
    }
    return new MeshHandle( new ManifoldMeshWrapper(ob, color ?? mw1.color,name ) );

}
type revolve_t = ( polygon : Vec2[],angle : number,color : PyColor,resolution : number,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_revolve : revolve_t }
};

self.impl_revolve = ( polygon : Vec2[],angle : number,color : PyColor,resolution : number,name : string ) : MeshHandle => {

    let o1 = manifold.Manifold.revolve(
            polygon,
            resolution ?? 36,
            angle ?? 360
    );
    return new MeshHandle( new ManifoldMeshWrapper( o1, color,name ) );


}
type rotate_t = ( objects : MeshHandle|MeshHandle[],axis : Vec3,angle : number,centroid : Vec3,color : PyColor,name : string ) => MeshHandle|MeshHandle[] ;
declare global {
    interface WorkerGlobalScope { impl_rotate : rotate_t }
};

self.impl_rotate = ( objects : MeshHandle|MeshHandle[],axis : Vec3,angle : number,centroid : Vec3,color : PyColor,name : string ) : MeshHandle|MeshHandle[] => {



    let x = axis[0];
    let y = axis[1];
    let z = axis[2];
    let len = Math.sqrt(x*x+y*y+z*z);
    //Python code already verified that length is not zero
    x /= len;
    y /= len;
    z /= len;

    let rotV: Vec3;
    let M: Mat4 = undefined;

    if( x === 1.0 && y === 0.0 && z === 0.0 ){
        rotV = [angle,0,0];
    } else if( x === -1.0 && y === 0.0 && z === 0.0 ){
        rotV = [-angle,0,0];
    } else if( x ===  0.0 && y === 1.0 && z === 0.0 ){
        rotV = [0,angle,0];
    } else if( x ===  0.0 && y === -1.0 && z === 0.0 ){
        rotV = [0,-angle,0];
    } else if( x ===  0.0 && y === 0.0 && z === 1.0 ){
        rotV = [0,0,angle];
    } else if( x ===  0.0 && y === 0.0 && z === -1.0 ){
        rotV = [0,0,-angle];
    } else {
        //need to use slow path
         M = computeRotationMatrix(x,y,z,angle);
    }


    function rotHelper(mw: ManifoldMeshWrapper){
        if( rotV !== undefined ){
            return new ManifoldMeshWrapper(
                transformAroundCentroid( centroid, mw,
                    (m: Manifold) => { return m.rotate(rotV); }
                ),
                color ?? mw.color,
                name
            );
        } else {
            return new ManifoldMeshWrapper(
                transformAroundCentroid( centroid, mw,
                    (m: Manifold) => { return m.transform(M); }
                ),
                color ?? mw.color,
                name
            );
        }
    }

    if( !objects.hasOwnProperty("length") ){
        //one object
        let mw = handleToWrapper(objects as MeshHandle);
        let mw2 = rotHelper(mw);
        return new MeshHandle(mw2);
    } else {
        let L: MeshHandle[] = objects as MeshHandle[];
        let result: MeshHandle[] = [];
        for(let i=0;i<L.length;++i){
            let mw = handleToWrapper(L[i]);
            let mw2 = rotHelper(mw);
            result.push( new MeshHandle(mw2) );
        }
        return result;
    }

}
type scale_t = ( objects : MeshHandle|MeshHandle[],sx : number,sy : number,sz : number,centroid : Vec3,color : PyColor,name : string ) => MeshHandle|MeshHandle[] ;
declare global {
    interface WorkerGlobalScope { impl_scale : scale_t }
};

self.impl_scale = ( objects : MeshHandle|MeshHandle[],sx : number,sy : number,sz : number,centroid : Vec3,color : PyColor,name : string ) : MeshHandle|MeshHandle[] => {

    if( !objects.hasOwnProperty("length") ){
        let object = objects as MeshHandle;
        let mw = handleToWrapper(object);
        let mw2 = new ManifoldMeshWrapper(
            transformAroundCentroid(centroid,mw,
                (m: Manifold) => { return m.scale([sx,sy,sz]); }
            ),
            color ?? mw.color,
            name
        );
        return new MeshHandle(mw2);
    } else {
        let L = objects as MeshHandle[];
        let output: MeshHandle[] = [];
        for(let i=0;i<L.length;++i){
            let mw = handleToWrapper(L[i]);
            let mw2 = new ManifoldMeshWrapper(
                transformAroundCentroid( centroid, mw,
                    (m: Manifold) => { return m.scale([sx,sy,sz]); }
                ),
                color ?? mw.color,
                name
            );
            output.push( new MeshHandle(mw2) );
        }
        return output;
    }

}
type sphere_t = ( radius : number,x : number,y : number,z : number,color : PyColor,resolution : number,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_sphere : sphere_t }
};

self.impl_sphere = ( radius : number,x : number,y : number,z : number,color : PyColor,resolution : number,name : string ) : MeshHandle => {

    let s = manifold.Manifold.sphere(radius, resolution);
    let s2 = s.translate([x, y,z]);
    s.delete();
    return new MeshHandle( new ManifoldMeshWrapper(s2,color,name) );

}
type translate_t = ( objects : MeshHandle|MeshHandle[],tx : number,ty : number,tz : number,color : PyColor,name : string ) => MeshHandle|MeshHandle[] ;
declare global {
    interface WorkerGlobalScope { impl_translate : translate_t }
};

self.impl_translate = ( objects : MeshHandle|MeshHandle[],tx : number,ty : number,tz : number,color : PyColor,name : string ) : MeshHandle|MeshHandle[] => {

    if( !objects.hasOwnProperty("length") ){
        //it's a single object
        let mw = handleToWrapper(objects as MeshHandle);
        return new MeshHandle(
            new ManifoldMeshWrapper(
                mw.mesh.translate(tx,ty,tz),
                color ?? mw.color,name
            )
        );
    } else {
        //list of objects
        let L: MeshHandle[] = objects as MeshHandle[];
        let output: MeshHandle[] = [];
        for(let i=0;i<L.length;++i){
            let mw = handleToWrapper(L[i]);
            let ob = mw.mesh.translate(tx,ty,tz);
            output.push(
                new MeshHandle(
                    new ManifoldMeshWrapper(
                        ob, color ?? mw.color,name
                    )
                )
            );
        }
        return output;
    }

}
type union_t = ( objects : MeshHandle[],color : PyColor,name : string ) => MeshHandle ;
declare global {
    interface WorkerGlobalScope { impl_union : union_t }
};

self.impl_union = ( objects : MeshHandle[],color : PyColor,name : string ) : MeshHandle => {

    if( objects.length === 1 )
        return objects[0];
    let mw1 = handleToWrapper(objects[0]);
    let mw2 = handleToWrapper(objects[1]);
    let ob = manifold.Manifold.union(
        mw1.mesh, mw2.mesh
    );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.union(
            ob,
            handleToWrapper( objects[i] ).mesh
        );
        ob.delete();
        ob=ob2;
    }
    return new MeshHandle( new ManifoldMeshWrapper(ob, color ?? mw1.color,name ) );

}
