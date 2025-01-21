import { Mesh } from "Mesh";
import { View } from "View";

export function saveSTL(){
    let meshes = View.get().getMeshes();

    if(!meshes || meshes.length == 0)
        return;

    let totalTriangles=0;
    meshes.forEach( (m: Mesh) => {
        //3 components per vertex
        let numComponents = m.vertices.length;
        let numVerts = numComponents/3;
        let numTris = numVerts/3;
        totalTriangles += numTris;
    });

    let A = new ArrayBuffer( 80+4+totalTriangles*50 );
    let D = new DataView(A);

    //offset    size    content
    //0         80      comment
    //80        4       u32 num triangles
    //84        50*nt  triangle data
    //Each triangle has 50 bytes:
    // nx,ny,nz (float32)
    // x,y,z (p0, float32)
    // x,y,z (p1, float32)
    // x,y,z (p2, float32)
    // zero (u16)

    let comment = "STL "+(new Date().toString());
    for(let i=0;i<comment.length;++i){
        D.setUint8( i, comment.charCodeAt(i) );
    }
    D.setUint32( 80, totalTriangles, true );
    let offset = 84;

    console.log(meshes);

    let eachTime;

    meshes.forEach( (m: Mesh) => {
        let numVerts = m.vertices.length/3; //x,y,z for each vertex
        let numTris = numVerts/3;   //3 vertices per triangle
        let k=0;
        for(let i=0;i<numTris;++i){
            let before = offset;
            D.setFloat32(offset, 0, true);      //nx
            offset += 4;
            D.setFloat32(offset, 0, true);      //ny
            offset += 4;
            D.setFloat32(offset, 0, true);      //nz
            offset += 4;
            for(let vertexNumber=0;vertexNumber<3;++vertexNumber){  //p0, p1, p2

                for(let j=0;j<3;++j){           //x,y,z
                    let val = m.vertices[k++];
                    D.setFloat32(offset, val*0.001, true); 
                    offset += 4;
                }
            }
            D.setUint16(offset,0,true); 
            offset += 2;
            let after=offset;
            eachTime = after-before
        }
    });

    //ref:https://stackoverflow.com/a/33542499
    let b = new Blob([A], {type: "model/stl"});
    let e = document.createElement("a");
    let u = URL.createObjectURL(b);
    e.href=u;
    e.download="model.stl";
    e.style.display="none";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);

    //free up memory after 180 seconds
    setTimeout( ()=>{
        URL.revokeObjectURL(u);
    }, 180 * 1000 );
}