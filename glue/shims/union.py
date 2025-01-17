
def union(objects: LIST_OF_MESH_HANDLE, color: COLOR=None) -> MESH_HANDLE:
    """
        Compute the union of several objects (a solid that encloses those points that are in any object)
        @param objects A list of the objects to join together.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

TS="""
    if( objects.length === 1 )
        return objects[0];
    let ob = manifold.Manifold.union( objects[0].mesh, objects[1].mesh );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.union( ob, objects[i].mesh );
        ob.delete();
        ob=ob2;
    }
    let color = (color ?? objects[0].color);
    return new ManifoldMeshWrapper(ob,color);
"""
