
def scale(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, sx:NUMBER, sy:NUMBER, sz: NUMBER, centroid: VEC3=None, color:COLOR=None) -> MESH_HANDLE:
    """
        Scale objects.
        @param objects The objects to translate. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.
        @param sx x factor; 1.0=no change
        @param sy y factor; 1.0=no change
        @param sz z factor; 1.0=no change
        @param centroid Point to scale the objects around; if None, scale each object around its own centroid
        @param color Color for the resulting objects; if None, use each individual object's color.
    """
    pass

TS="""
    let objs: MeshHandle[];
    if( objects.length === undefined ){
        //it's a single object
        objs = [ objects as ManifoldMeshWrapper ];
    } else {
        //it's a list
        objs = objects as ManifoldMeshWrapper[];
    }

    let output: ManifoldMeshWrapper[] = [];
    for(let i=0;i<objs.length;++i){
        output.push( transformAroundCentroid( centroid, color, objs[i],
            (m: Manifold) => { return m.scale(sx,sy,sz); }
        ));
    }

    if( objects.length === undefined ){
        //single object in; single object out
        return [ new MeshHandle(output[0]) ];
    } else {
        //list in; list out
        let tmp: MeshHandle[] = [];
        for(let i=0;i<output.length;++i)
            tmp.push(new MeshHandle(output[i]));
        return tmp;
    }
}
"""
