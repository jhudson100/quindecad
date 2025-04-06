
export class Transformation{

    //3 numbers: tx, ty, tz. The current translation
    translation: number[];

    //3 numbers: sx, sy, sz
    scale: number[];

    constructor(){
        this.translation = [0,0,0];
        this.scale = [1,1,1];
    }

}