from shims.gluetypes import *



def sphere( radius: POSITIVE_NUMBER,
            x: NUMBER=0.0,
            y: NUMBER=0.0,
            z: NUMBER=0.0,
            color: COLOR=None,
            resolution: POSITIVE_INTEGER=48, name: STRING=None) -> MESH_HANDLE:
    """
    Creates a sphere.
    @param x Sphere center x
    @param y Sphere center y
    @param z Sphere center z
    @param radius Sphere radius
    @param resolution How finely tessellated the sphere should be
    @param color Color for the object, or None for default color.
    @param name Name for the object
    """
    pass

TS="""
    let s = manifold.Manifold.sphere(radius, resolution);
    if(x !== 0.0 || y !== 0.0 || z !== 0.0 ){
        let s2 = s.translate([x, y, z]);
        s.delete();
        s=s2;
    }
    return new MeshHandle( new ManifoldMeshWrapper(s2,color,name) );
"""
