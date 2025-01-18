from shims.gluetypes import MESH_HANDLE

def free( obj: MESH_HANDLE) -> None:
    """
    Free the memory associated with the given object. Note: The object may not be used after this function has been called or an exception may occur.
    @param obj The object to free.
    """
    pass


TS = """
    let mw = handleToWrapper( obj );
    mw.mesh.delete();
    mw.freed=true;
"""
