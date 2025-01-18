from shims.gluetypes import *


def translate(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, tx:NUMBER, ty:NUMBER, tz: NUMBER, color:COLOR=None) -> MESH_HANDLE|LIST_OF_MESH_HANDLE:
    """
        Move objects to another location. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.
        @param objects The objects to translate
        @param tx Change in x
        @param ty Change in y
        @param tz Change in z
        @param color Color for the resulting objects; if None, use each individual object's color.
    """
    pass

TS="""
    if( !objects.hasOwnProperty("length") ){
        //it's a single object
        let mw = handleToWrapper(objects as MeshHandle);
        return new MeshHandle(
            new ManifoldMeshWrapper(
                mw.mesh.translate(tx,ty,tz),
                color ?? mw.color
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
                        ob, color ?? mw.color
                    )
                )
            );
        }
        return output;
    }
"""
