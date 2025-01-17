


def cube(xsize: POSITIVE_NUMBER,
         ysize: POSITIVE_NUMBER,
         zsize: POSITIVE_NUMBER,
         x:NUMBER=0.0,
         y:NUMBER=0.0,
         z:NUMBER=0.0,
         centered: BOOLEAN=False,
         color: COLOR=None) -> MESH_HANDLE:
    """
    Creates a cuboid
    @param xsize Size of the cuboid in the x direction
    @param ysize Size of the cuboid in the y direction
    @param zsize Size of the cuboid in the z direction
    @param x X coordinate of the cuboid
    @param y Y coordinate of the cuboid
    @param z Z coordinate of the cuboid
    @param centered True if the cuboid should be centered around (x,y,z); false if the minimum coordinate is at (x,y,z).
    @param color Color for the object, or None for default color.
    """
    pass


TS="""
    let c = manifold.Manifold.cube(
        [xsize, ysize, zsize],
        centered
    );
    let c2 = c.translate([x,y,z]);
    c.delete()
    return new MeshHandle( new ManifoldMeshWrapper(c2,color) );
"""
