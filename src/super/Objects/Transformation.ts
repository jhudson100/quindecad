
export class Transformation{

    //3 numbers: tx, ty, tz. The current translation
    translation: number[];

    //3 numbers: sx, sy, sz
    scale: number[];

    constructor(){
        this.translation = [0,0,0];
        this.scale = [1,1,1];
    }

    apply( x: number, y: number, z: number ){
        x *= this.scale[0];
        y *= this.scale[1];
        z *= this.scale[2];
        //apply rotation
        x += this.translation[0];
        y += this.translation[1];
        z += this.translation[2];
        return [x,y,z];
    }
}