

def boundingbox(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE) -> LIST_OF_VEC3:
    """
        Compute the bounding box of the given objects. Returns a list of two tuples. The first tuple has the minimum x,y,z; the second has the maximum x,y,z.
        @param objects The objects for the computation.
    """
    pass

TS="""
    let objs: MeshHandle[] = [];
    if( objects.length === undefined ){
        objs = [objects];
    else
        objs = objects;
    let mw:ManifoldMeshWrapper = manifoldMeshes[objs[0].index];
    let tmp = mw.mesh.boundingbox()
    let minimum = tmp[0];
    let maximum = tmp[1];
    for(let i=1;i<objs.length;++i){
        mw = manifoldMeshes[objs[i].index];
        tmp = mw.mesh.boundingbox();
        for(let i=0;i<3;++i){
            if( tmp[0][i] < minimum[i] )
                minimum[i] = tmp[0][i];
            if( tmp[1][i] > maximum[i] )
                maximum[i] = tmp[1][i];
        }
    }
    return [ minimum, maximum ];
}
"""
