from shims.gluetypes import *

def revolve(polygon: POLYGON2D, angle: NUMBER=None, color: COLOR=None,
        resolution: POSITIVE_INTEGER=36, name: STRING=None) -> MESH_HANDLE:
    """
        Create a solid of revolution. The axis of the solid is the z axis.
        @param polygon The polygon to revolve, as a list of (x,y) pairs. These MUST be specified in counterclockwise order!
        @param angle Angle of revolution in degrees. If None, use 360 degrees
        @param color Color for the object; if None, use default color
        @param resolution The number of steps for the revolution
        @param name Name for the object
    """
    pass

TS="""
    let color_ = convertColorToQuadruple(color);
    let o1 = manifold.Manifold.revolve(
            polygon,
            resolution ?? 36,
            angle ?? 360
    );
    return new MeshHandle( new ManifoldMeshWrapper( o1, color_, name ) );

"""
