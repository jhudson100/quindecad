from shims.gluetypes import *


def cut(object: MESH_HANDLE, planeNormal: VEC3, planeD: NUMBER, keepPositive: BOOLEAN, color:COLOR=None) -> MESH_HANDLE:
    """
        Cuts the given object with a plane and discards one half. A plane is defined by the equation Ax + By + Cz + D = 0 where the plane normal is (A,B,C) and D depends on the plane's distance from the origin.
        @param object The object to cut
        @param planeNormal The normal to the plane
        @param planeD Fourth component of plane equation
        @param keepPositive If True, keep the part of the object on the side that planeNormal points to; if False, keep the part of the object on the other side of the plane
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass


TS="""
    let mw = handleToWrapper(object);
    let results = mw.mesh.splitByPlane( planeNormal, planeD);
    let ki = ( keepPositive ? 0 : 1 );
    results[1-ki].delete();
    return new MeshHandle( new ManifoldMeshWrapper( results[ki], color ?? mw.color ) );
"""
