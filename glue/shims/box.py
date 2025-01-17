
def box( min: VEC3, max: VEC3, color: COLOR=None) -> MESH_HANDLE:
    """
    Create a box that goes from the given minimum coordinate to the given maximum coordinate
    @param min The minimum coordinate
    @param max The maximum coordinate
    @param color Color for the object, or None for default color.
    """
    pass


TS="""
    let xsize = max[0]-min[0];
    let ysize = max[1]-min[1];
    let zsize = max[2]-min[2];
    if( xsize<=0 )
        throw new Error("box(): max x <= min x");
    if( ysize<=0 )
        throw new Error("box(): max y <= min y");
    if( zsize<=0 )
        throw new Error("box(): max z <= min z");

    let c = manifold.Manifold.cube(
        [xsize, ysize, zsize],
        false
    );
    let c2 = c.translate(min);
    c.delete()
    return new MeshHandle( new ManifoldMeshWrapper(c2,color) );
"""
