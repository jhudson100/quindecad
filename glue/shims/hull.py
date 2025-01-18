from shims.gluetypes import *



def hull(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, color: COLOR=None) -> MESH_HANDLE:
    """
        Compute the convex hull of the union of the given objects.
        @param objects The objects for the hull computation.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

TS="""

    if(!objects.hasOwnProperty("length") ){
        let mw = handleToWrapper( objects as MeshHandle );
        let o2 = mw.mesh.hull();
        return new MeshHandle( new ManifoldMeshWrapper( o2, color ?? mw.color ) );
    } else {
        let L = objects as MeshHandle[];
        if( L.length === 1 ){
            let mw = handleToWrapper( L[0] );
            let o2 = mw.mesh.hull();
            return new MeshHandle( new ManifoldMeshWrapper( o2, color ?? mw.color ) );
        } else {
            let mw = handleToWrapper(L[0]);
            let ob = mw.mesh;
            for(let i=1;i<L.length;++i){
                let ob2 = manifold.Manifold.union(
                    ob,
                    handleToWrapper( L[i] ).mesh
                );
                if( i !== 1 )
                    ob.delete();
                ob = ob2;
            }
            let ob3 = ob.hull();
            //at this point, we had at least two things in the list
            //so ob represents the result of a union operation,
            //and we must delete it.
            ob.delete();
            return new MeshHandle( new ManifoldMeshWrapper( ob3, color ?? mw.color ));
        }
    }
"""
