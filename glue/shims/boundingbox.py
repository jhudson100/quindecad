from shims.gluetypes import *



def boundingbox(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE) -> LIST_OF_VEC3:
    """
        Compute the bounding box of the given objects. Returns a list of two tuples. The first tuple has the minimum x,y,z; the second has the maximum x,y,z.
        @param objects The objects for the computation.
    """
    pass

TS="""
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
"""
