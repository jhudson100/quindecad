from shims.gluetypes import *


def genus( obj: MESH_HANDLE
    ) -> NUMBER:
    """
    Compute the genus (number of holes) of the given object.
    @param obj The object for the computation
    """
    pass


TS="""
    let mh = handleToWrapper(obj);
    return mh.mesh.genus();
"""
