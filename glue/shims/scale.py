from shims.gluetypes import *


def scale(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, sx:NUMBER, sy:NUMBER, sz: NUMBER,
        centroid: VEC3=None, color:COLOR=None, name: STRING=None) -> MESH_HANDLE|LIST_OF_MESH_HANDLE:
    """
        Scale objects.
        @param objects The objects to translate. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.
        @param sx x factor; 1.0=no change
        @param sy y factor; 1.0=no change
        @param sz z factor; 1.0=no change
        @param centroid Point to scale the objects around; if None, scale each object around its own centroid
        @param color Color for the resulting objects; if None, use each individual object's color.
        @param name Name for the object
    """
    pass

TS="""
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
"""
