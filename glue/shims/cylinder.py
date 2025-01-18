from shims.gluetypes import *


def cylinder(   x: NUMBER,
                y: NUMBER,
                z: NUMBER,
                radius: POSITIVE_NUMBER,
                height: POSITIVE_NUMBER,
                zcenter: BOOLEAN=True,
                color:COLOR=None,
                resolution: POSITIVE_INTEGER=36) -> MESH_HANDLE:
    """
    Creates a cylinder; the cylinder's axis is parallel to the z axis.
    @param x Cylinder center x
    @param y Cylinder center y
    @param z Cylinder z. See the zcenter argument.
    @param radius Radius of the cylinder
    @param height Height of the cylinder
    @param zcenter If True, (x,y,z) is the coordinate of the cylinder's center. If false, (x,y,z) is the center of the bottom of the cylinder.
    @param resolution Number of edges around the cylinder's circumference
    @param color Color for the object, or None for default color.
    """
    pass


TS="""
    let c = manifold.Manifold.cylinder(height,
        radius, radius, resolution,
        zcenter
    );
    let c2 = c.translate([x, y, z]);
    c.delete();
    return new MeshHandle( new ManifoldMeshWrapper(c2,color) );
"""
