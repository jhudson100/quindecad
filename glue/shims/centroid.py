from shims.gluetypes import *

def centroid(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE) -> VEC3:
    """
    Returns the centroid of the object or group of objects; the return value is a list (x,y,z).
    @param objects A solid object or a list of solid objects.
    """
    pass

TS="""
    let bb: number[][];
    if(!objects.hasOwnProperty("length") ){
        let mw = handleToWrapper( objects as MeshHandle );
        let bb1 = mw.mesh.boundingBox();
        bb = [ [bb1.min[0], bb1.min[1], bb1.min[2]] ,
               [bb1.max[0], bb1.max[1], bb1.max[2]]
        ];
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
        bb = [ minimum, maximum ];
    }
    return [ 0.5*(bb[0][0] + bb[1][0]),
             0.5*(bb[0][1] + bb[1][1]),
             0.5*(bb[0][2] + bb[1][2])
    ];


"""
