
def difference(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, color: COLOR=None) -> MESH_HANDLE:
    """
        Compute the set difference: objects[0] - objects[1] - objects[2] - ... . The set difference a-b consists of those points that are in a but not in b.
        @param objects A list of the objects for the computation.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass


TS="""
    if( objects.length === 1 )
        return objects[0];
    let ob = manifold.Manifold.difference( objects[0].mesh, objects[1].mesh );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.difference( ob, objects[i].mesh );
        ob.delete();
        ob=ob2;
    }
    let color = (color ?? objects[0].color);
    return new ManifoldMeshWrapper(ob,color);
"""
