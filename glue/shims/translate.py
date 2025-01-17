
def translate(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, tx:NUMBER, ty:NUMBER, tz: NUMBER, color:COLOR=None) -> MESH_HANDLE:
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
    let objs: MeshHandle[];
    if( objects.length === undefined ){
        //it's a single object
        objs = [ objects ];
    } else {
        //it's a list
        objs = objects;
    }

    let output: MeshHandle[] = [];
    for(let i=0;i<objs.length;++i){
        let ob = objs[i].mesh.translate( tx,ty,tz );
        output.push(new MeshHandle( new ManifoldMeshWrapper( ob, color ?? objs[i].color ) ) );
    }

    if( objects.length === undefined ){
        //single object in; single object out
        return output[0];
    } else {
        //list in; list out
        return output;
    }
}

"""
