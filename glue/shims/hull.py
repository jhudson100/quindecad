

def hull(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, color: COLOR=None) -> MESH_HANDLE:
    """
        Compute the convex hull of the given objects.
        @param objects The objects for the hull computation.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

TS="""
    let ob: Manifold;
    let needFree=false;

    if( objects.length === undefined ){
        //one object
        ob = objects;
    } else if( objects.length === 1 ){
        ob = objects[0];
    } else {
        //Python code ensured length of list > 0
        let ob = manifold.Manifold.union( objects[0].mesh, objects[1].mesh );
        for(let i=2;i<objects.length;++i){
            let ob2 = manifold.Manifold.union( ob, objects[i].mesh );
            ob.delete();
            ob=ob2;
        }
        needFree=true;
    }

    let o2 = manifold.Manifold.hull(ob);
    if(needFree)
        ob.delete()

    return new ManifoldMeshWrapper( o2, color ?? ob.color );
"""
