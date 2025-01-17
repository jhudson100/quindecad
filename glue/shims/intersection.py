
def intersection(objects: LIST_OF_MESH_HANDLE, color: COLOR=None) -> MESH_HANDLE:
    """
        Compute the intersection of several objects (a solid that encloses those points that are in all of the objects)
        @param objects A list of the objects to intersect.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

TS="""
    if( objects.length === 1 )
        return objects[0];
    let ob = manifold.Manifold.intersection( objects[0].mesh, objects[1].mesh );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.intersection( ob, objects[i].mesh );
        ob.delete();
        ob=ob2;
    }
    let color = (color ?? objects[0].color);
    return new ManifoldMeshWrapper(ob,color);
"""
