from shims.gluetypes import *


def cut(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, planeNormal: NONZERO_VEC3, planeD: NUMBER,
        keepPositive: BOOLEAN, color:COLOR=None, name: STRING=None) -> MESH_HANDLE|LIST_OF_MESH_HANDLE:
    """
        Cuts the given object(s) with a plane and discards one half. A plane is defined by the equation Ax + By + Cz + D = 0 where the plane normal is (A,B,C) and D depends on the plane's distance from the origin.
        @param objects Either a single object or a list of objects.
        @param planeNormal The normal to the plane
        @param planeD Fourth component of plane equation
        @param keepPositive If True, keep the part of the object on the side that planeNormal points to; if False, keep the part of the object on the other side of the plane
        @param color Color for the object; if None, use the color of the first object in the list
        @param name Name for the object
    """
    pass


TS="""
    if( !objects.hasOwnProperty("length") ){
        let mw = handleToWrapper(objects as MeshHandle);
        let results = mw.mesh.splitByPlane( planeNormal, planeD);
        let ki = ( keepPositive ? 0 : 1 );
        results[1-ki].delete();
        return new MeshHandle( new ManifoldMeshWrapper( results[ki], color ?? mw.color,name ) );
    } else {
        let ki = ( keepPositive ? 0 : 1 );
        let L = objects as MeshHandle[];
        let result: MeshHandle[] = [];
        for(let i=0;i<L.length;++i){
            let mw = handleToWrapper(L[i]);
            console.log("mw=",mw);
            let tmp = mw.mesh.splitByPlane( planeNormal, planeD);
            tmp[1-ki].delete();
            result.push( new MeshHandle( new ManifoldMeshWrapper( tmp[ki], color ?? mw.color, name ) ) );
        }
        return result;
    }
"""
