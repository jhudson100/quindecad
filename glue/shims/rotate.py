

def rotate(objects: MESH_HANDLE|LIST_OF_MESH_HANDLE, axis: NONZERO_VEC3, angle: NUMBER, centroid: VEC3=None, color: COLOR=None) -> MESH_HANDLE:
    """
        Rotate objects by 'angle' *degrees* around the given axis. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.
        @param objects The objects to translate
        @param axis The axis of rotation; must not be zero length
        @param angle The angle of rotation in degrees
        @param centroid The point around which to rotate; if None, each object is rotated around its own centeroid
        @param color Color for the resulting objects; if None, use each individual object's color.
    """
    pass

TS="""
    let objs: MeshHandle[];
    if( objects.length === undefined ){
        //it's a single object
        objs = [ objects ];
    } else {
        //it's a list
        objs = objects ;
    }


    let output: ManifoldMeshWrapper[] = [];

    let x = axis[0];
    let y = axis[1];
    let z = axis[2];
    let len = Math.sqrt(x*x+y*y+z*z);
    //Python code already verified that length is not zero
    x /= len;
    y /= len;
    z /= len;

    let rotV: Vec3;
    if( x === 1.0 && y === 0.0 && z === 0.0 ){
        rotV = [angle,0,0];
    } else if( x === -1.0 && y === 0.0 && z === 0.0 ){
        rotV = [-angle,0,0];
    } else if( x ===  0.0 && y === 1.0 && z === 0.0 ){
        rotV = [0,angle,0];
    } else if( x ===  0.0 && y === -1.0 && z === 0.0 ){
        rotV = [0,-angle,0];
    } else if( x ===  0.0 && y === 0.0 && z === 1.0 ){
        rotV = [0,0,angle];
    } else if( x ===  0.0 && y === 0.0 && z === -1.0 ){
        rotV = [0,0,-angle];
    } else {
        //need to use slow path
    }

    if( rotV !== undefined ){
        for(let i=0;i<objs.length;++i){
            output.push( transformAroundCentroid( centroid, color, objs[i],
                (m: Manifold) => { return m.rotate(rotV); }
            ));
        }
    } else {
        let M = computeRotationMatrix(x,y,z,angle);
        for(let i=0;i<objs.length;++i){
            output.push( transformAroundCentroid( centroid, color, objs[i],
                (m: Manifold) => { return m.transform(M); }
            ));
        }
    }

    if( objects.length === undefined ){
        //single object in; single object out
        return new MeshHandle(output[0]);
    } else {
        //list in; list out
        let tmp: MeshHandle[] = [];
        for(let i=0;i<output.length;++i)
            tmp.push(new MeshHandle(output[i]));
        return tmp;
    }
}
"""
