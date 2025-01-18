from shims.gluetypes import *


# FIXME: Manifold can handle a CrossSection object here too...
def extrude(polygon: POLYGON2D, height: POSITIVE_NUMBER, divisions: POSITIVE_INTEGER=None, twist: NUMBER=None, scale: VEC2=None, zcenter: BOOLEAN=False, color: COLOR=None) -> MESH_HANDLE:
    """
        Extrude a 2D polygon (polygon which lies in the XY plane). The extrusion is in the Z direction.
        @param polygon The polygon to extrude, as a list of [x,y] tuples
        @param height The height of the extrusion
        @param divisions = Number of divisions in the extrusion
        @param twist Amount of twist (rotation) of the top relative to the bottom in degrees
        @param scale Amount to scale the top coordinates; (0,0) gives a cone; (1,1) gives the same size as the bottom.
        @param zcenter If true, the extruded shape will be centered around the z axis. If false, the extruded shape will have z=0 as its minimum z value.
        @param color Color for the object; if None, use default color
    """
    pass

TS="""
    let o1 = manifold.Manifold.extrude(
            polygon,
            height ?? 1,
            divisions ?? 1,
            twist ?? 0,
            scale ?? [1,1],
            zcenter
    );
    return new MeshHandle( new ManifoldMeshWrapper( o1, color ) );
"""
