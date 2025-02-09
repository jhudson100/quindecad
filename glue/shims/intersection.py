from shims.gluetypes import *


def intersection(objects: LIST_OF_MESH_HANDLE, color: COLOR=None, name: STRING=None) -> MESH_HANDLE:
    """
        Compute the intersection of several objects (a solid that encloses those points that are in all of the objects)
        @param objects A list of the objects to intersect.
        @param color Color for the object; if None, use the color of the first object in the list
        @param name Name for the object
    """
    pass

TS="""
    if( objects.length === 1 ){
        throw new Error("Cannot take intersection of only one object");
    }

    let color_ = convertColorToQuadruple(color);
    
    let mw1 = handleToWrapper(objects[0]);
    let mw2 = handleToWrapper(objects[1]);
    let ob = manifold.Manifold.intersection(
        mw1.mesh, mw2.mesh
    );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.intersection(
            ob,
            handleToWrapper(objects[i]).mesh
        );
        ob.delete();
        ob=ob2;
    }
    return new MeshHandle( new ManifoldMeshWrapper(ob, color_ ?? mw1.color,name ) );
"""
