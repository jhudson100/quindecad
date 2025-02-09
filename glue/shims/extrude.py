from shims.gluetypes import *


def extrude(polygon: POLYGON2D, height: POSITIVE_NUMBER, divisions: POSITIVE_INTEGER=None,
            twist: NUMBER=None, scale: VEC2=None, zcenter: BOOLEAN=False,
            color: COLOR=None, name: STRING=None) -> MESH_HANDLE:
    """
        Extrude a 2D polygon (polygon which lies in the XY plane). The extrusion is in the Z direction. Note that the vertices MUST be specified in counterclockwise order.
        @param polygon The polygon to extrude, as a list of [x,y] tuples
        @param height The height of the extrusion
        @param divisions = Number of divisions in the extrusion
        @param twist Amount of twist (rotation) of the top relative to the bottom in degrees
        @param scale Amount to scale the top coordinates; (0,0) gives a cone; (1,1) gives the same size as the bottom.
        @param zcenter If true, the extruded shape will be centered around the z axis. If false, the extruded shape will have z=0 as its minimum z value.
        @param color Color for the object; if None, use default color
        @param name Name for the object
    """
    pass

TS="""

    let poly: Vec2[] = [];
    for(let i=0;i<polygon.length;++i){
        poly.push( [polygon[i][0], polygon[i][1]] );
    }
    if( height === undefined )
        height = 1;
    if( divisions === undefined )
        divisions = 1;
    if( twist === undefined )
        twist = 0;
    if( scale === undefined )
        scale = [1,1]
    else
        scale = [ scale[0], scale[1] ]

    let o1 = manifold.Manifold.extrude(
            poly,
            height,
            divisions,
            twist,
            scale,
            zcenter
    );
    return new MeshHandle( new ManifoldMeshWrapper( o1, color ,name) );
"""
