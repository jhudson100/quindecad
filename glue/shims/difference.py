from shims.gluetypes import *


def difference(objects: LIST_OF_MESH_HANDLE, color: COLOR=None, name: STRING=None) -> MESH_HANDLE:
    """
        Compute the set difference: objects[0] - objects[1] - objects[2] - ... . The set difference a-b consists of those points that are in a but not in b.
        @param objects A list of the objects for the computation.
        @param color Color for the object; if None, use the color of the first object in the list
        @param name Name for the object
    """
    pass


TS="""
    if( objects.length === 1 ){
        throw new Error("Cannot take difference of only one object");
    }
    let color_ = convertColorToQuadruple(color);    
    let mw1 = handleToWrapper(objects[0]);
    let mw2 = handleToWrapper(objects[1]);
    let ob = manifold.Manifold.difference( mw1.mesh, mw2.mesh );
    for(let i=2;i<objects.length;++i){
        mw2 = handleToWrapper(objects[i]);
        let ob2 = manifold.Manifold.difference( ob, mw2.mesh );
        ob.delete();
        ob=ob2;
    }
    return new MeshHandle( new ManifoldMeshWrapper(ob,color_ ?? mw1.color,name) );
"""
