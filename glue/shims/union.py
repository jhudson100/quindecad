from shims.gluetypes import *

def union(objects: LIST_OF_MESH_HANDLE, color: COLOR=None,
        name: STRING=None) -> MESH_HANDLE:
    """
        Compute the union of several objects (a solid that encloses those points that are in any object)
        @param objects A list of the objects to join together.
        @param color Color for the object; if None, use the color of the first object in the list
        @param name Name for the object
        @param name Name for the object
    """
    pass

TS="""
    let color_ = convertColorToQuadruple(color);
    if( objects.length === 1 ){
        throw new Error("Cannot take union of one object");
    }
    let mw1 = handleToWrapper(objects[0]);
    let mw2 = handleToWrapper(objects[1]);
    let ob = manifold.Manifold.union(
        mw1.mesh, mw2.mesh
    );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.union(
            ob,
            handleToWrapper( objects[i] ).mesh
        );
        ob.delete();
        ob=ob2;
    }
    return new MeshHandle( new ManifoldMeshWrapper(ob, color_ ?? mw1.color,name ) );
"""
