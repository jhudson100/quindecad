
export type Color = [number,number,number,number?];

export class Mesh{
    vertices:  Float32Array;
    color: Color;
    name: string;

    constructor(positions: Float32Array, indices: Uint32Array, color: Color, name: string)
    {
        this.name=name;
        //convert to faceted, no shared vertices
        this.vertices = new Float32Array(indices.length*3);
        for(let i=0,j=0;i<indices.length;++i){
            let vi = indices[i];
            if( vi === undefined )
                throw new Error("Internal error: No vertex index for mesh");
            vi *= 3;
            let x = positions[vi++];
            let y = positions[vi++];
            let z = positions[vi++];
            if( x === undefined )
                throw new Error("Internal error: No x coordinate for mesh");
            if( y === undefined )
                throw new Error("Internal error: No y coordinate for mesh");
            if( z === undefined )
                throw new Error("Internal error: No z coordinate for mesh");
               
            this.vertices[j++] = x;
            this.vertices[j++] = y;
            this.vertices[j++] = z;
        }
        this.color=color;
    }

    toSTL(): ArrayBuffer{
        //offset    content
        //0         comment
        //80        u32 num triangles
        //84        triangle data
        //Each triangle has 146 bytes:
        // nx,ny,nz (float32)
        // x,y,z (p0, float32)
        // x,y,z (p1, float32)
        // x,y,z (p2, float32)
        // zero (u16)

        let numVerts = this.vertices.length/3;
        let numTris = numVerts/3;

        let A = new ArrayBuffer( 80+4+numTris*146 );
        let D = new DataView(A);
        let comment = "STL "+(new Date().toString());
        for(let i=0;i<comment.length;++i){
            D.setUint8( comment.charCodeAt(i), i );
        }
        D.setUint32( 80, numTris, true );
        let offset = 84;
        for(let i=0,k=0;i<numTris;+i){
            D.setFloat32(offset, 0, true); offset += 4;
            D.setFloat32(offset, 0, true); offset += 4;
            D.setFloat32(offset, 0, true); offset += 4;
            for(let j=0;j<3;++j){
                let v = this.vertices[k++];
                if(v === undefined )
                    throw new Error("Internal error");
                D.setFloat32(offset, v, true); offset += 4;
            }
            D.setUint16(offset,0,true); offset += 2;
        }
        return A;
    }

} //end class Mesh
