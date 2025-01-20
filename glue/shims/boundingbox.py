from shims.gluetypes import *



def boundingbox(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE) -> LIST_OF_VEC3:
    """
        Compute the bounding box of the given objects. Returns a list of two tuples. The first tuple has the minimum x,y,z; the second has the maximum x,y,z.
        @param objects The objects for the computation.
        @param name Name for the object
    """
    pass

TS="""
    if(!objects.hasOwnProperty("length") ){
        let mw = handleToWrapper( objects as MeshHandle );
        let bb = mw.mesh.boundingBox();
        let mn: Vec3 = [bb.min[0], bb.min[1], bb.min[2] ];
        let mx: Vec3 = [bb.max[0], bb.max[1], bb.max[2] ];
        return [ mn, mx ];
    } else {
        let L = objects as MeshHandle[];
        let objs: MeshHandle[] = [];
        let mw = handleToWrapper( L[0] );
        let tmp = mw.mesh.boundingBox();
        let minimum: Vec3 = [tmp.min[0],tmp.min[1],tmp.min[2]];
        let maximum: Vec3 = [tmp.max[0],tmp.max[1],tmp.max[2]];
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
