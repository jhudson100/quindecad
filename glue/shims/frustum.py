from shims.gluetypes import *


def frustum(radius1:POSITIVE_NUMBER,
            radius2:POSITIVE_NUMBER,
            height: POSITIVE_NUMBER,
            x:NUMBER=0.0, y:NUMBER=0.0, z:NUMBER=0.0,
            zcenter: BOOLEAN=True,
            color:COLOR=None,
            resolution: POSITIVE_INTEGER=36) -> MESH_HANDLE:
    """
        Creates a frustum; the frustum's axis is parallel to the z axis.
        @param x Frustum center x
        @param y Frustum center y
        @param z Frustum z. See the zcenter argument.
        @param radius1 Radius of the frustum at minimum z
        @param radius2 Radius of the frustum at maximum z
        @param height Height of the frustum
        @param zcenter If True, (x,y,z) is the coordinate of the frustum's center. If false, (x,y,z) is the center of the bottom of the frustum.
        @param color Color for the object, or None for default color.
        @param resolution Number of edges around the cylinder's circumference
    """
    pass


TS="""
    let c = manifold.Manifold.cylinder(height,
        radius1, radius2, resolution,
        zcenter
    );
    let c2 = c.translate([x, y, z]);
    c.delete();
    return new MeshHandle( new ManifoldMeshWrapper(c2,color) );
"""
