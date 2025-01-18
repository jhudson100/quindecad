from shims.gluetypes import *



def sphere( radius: POSITIVE_NUMBER,
            x: NUMBER=0.0,
            y: NUMBER=0.0,
            z: NUMBER=0.0,
            color: COLOR=None,
            resolution: POSITIVE_INTEGER=48) -> MESH_HANDLE:
    """
    Creates a sphere.
    @param x Sphere center x
    @param y Sphere center y
    @param z Sphere center z
    @param radius Sphere radius
    @param resolution How finely tessellated the sphere should be
    @param color Color for the object, or None for default color.
    """
    pass

TS="""
    let s = manifold.Manifold.sphere(radius, resolution);
    let s2 = s.translate([x, y,z]);
    s.delete();
    return new MeshHandle( new ManifoldMeshWrapper(s2,color) );
"""
