// A DrawCommand is a single CSG operation.
//It's essentially stored as a dictionary.
//Ex: For Python code like so:
//  c = cube( xsize=5, ysize=3, zsize=2 )
//  t = translate( c, tx=10, ty=20, tz=30 )
// c would be a dictionary like so:
//      {type: "CUBE", "xsize": 5, "ysize": 3, "zsize": 2, ...etc... }
// and t would be:
//      {type: "TRANSLATE", object1={ type: "CUBE" , ... }  }

import { Color } from "./Mesh";


export enum DrawCommandType {
    CUBE="CUBE", 
    SPHERE="SPHERE", 
    CYLINDER="CYLINDER", 
    FRUSTUM="FRUSTUM",
    UNION="UNION", 
    INTERSECTION="INTERSECTION",
    DIFFERENCE="DIFFERENCE",
    TRANSLATE="TRANSLATE",
    ROTATE="ROTATE",
    SCALE="SCALE",
    HULL="HULL",
    BOUNDINGBOX="BOUNDINGBOX",
    CUT="CUT",
    EXTRUDE="EXTRUDE",
    REVOLVE="REVOLVE"
};

export type Vec2 = [number,number];
export type Polygon2D = Vec2[];

export class DrawCommand{
    type: DrawCommandType;
    color: Color;
    constructor(type:DrawCommandType, color: Color){
        this.type=type;
        this.color=color;
    }
}

export class Cube extends DrawCommand{
    xsize: number;
    ysize: number;
    zsize: number;
    centered: boolean;
    constructor(color: Color, xsize:number, ysize: number, zsize: number, centered: boolean){
        super(DrawCommandType.CUBE,color);
        this.xsize=xsize;
        this.ysize=ysize;
        this.zsize=zsize;
        this.centered=centered;
    }
}

export class Sphere extends DrawCommand {
    x: number;
    y: number;
    z: number;
    radius: number;
    resolution: number;
    constructor(color: Color, centerx:number, centery: number, centerz: number, radius: number, resolution: number){
        super(DrawCommandType.SPHERE,color);
        this.x=centerx;
        this.y=centery;
        this.z=centerz;
        this.radius=radius;
        this.resolution=resolution;
    }
}


export class Cylinder extends DrawCommand {
    x: number;
    y: number;
    z: number;
    radius: number;
    height: number;
    resolution: number;
    //true: center of cylinder is at z (cylinder goes from z-h/2...z+h/2)
    //false: bottom of cylinder is at z (cylinder goes from z to z+h)
    zcenter: boolean;       
    constructor(color: Color,  centerx: number, centery: number, centerz: number, radius: number,
                height: number, resolution: number, centered: boolean ){
        super(DrawCommandType.SPHERE, color);
        this.x = centerx;
        this.y =centery;
        this.z = centerz;
        this.radius = radius;
        this.height = height;
        this.resolution = resolution;
        this.zcenter = centered;
    }
}


export class Frustum extends DrawCommand {
    x: number;
    y: number;
    z: number;
    radius1: number;
    radius2: number;
    height: number;
    resolution: number;
    zcenter: boolean;
    constructor(color: Color,  centerx: number, centery: number, centerz: number, radius1: number,
                radius2: number, height: number, resolution: number, centered: boolean ){
        super(DrawCommandType.FRUSTUM, color);
        this.x = centerx;
        this.y =centery;
        this.z = centerz;
        this.radius1 = radius1;
        this.radius2 = radius2;
        this.height = height;
        this.resolution = resolution;
        this.zcenter = centered;
    }
}

export class Union extends DrawCommand{
    object1: DrawCommand;
    object2: DrawCommand;
    constructor(color: Color, command1: DrawCommand, command2: DrawCommand){
        super(DrawCommandType.UNION, color);
        this.object1=command1;
        this.object2=command2;
    }
}

export class Intersection extends DrawCommand{
    object1: DrawCommand;
    object2: DrawCommand;
    constructor(color: Color, command1: DrawCommand, command2: DrawCommand){
        super(DrawCommandType.INTERSECTION, color);
        this.object1=command1;
        this.object2=command2;
    }
}

export class Difference extends DrawCommand{
    object1: DrawCommand;
    object2: DrawCommand;
    constructor(color: Color, command1: DrawCommand, command2: DrawCommand){
        super(DrawCommandType.DIFFERENCE, color);
        this.object1=command1;
        this.object2=command2;
    }
}


export class Translate extends DrawCommand{
    object1: DrawCommand;
    tx: number;
    ty: number;
    tz: number;
    constructor(color: Color, command1: DrawCommand, tx: number, ty: number, tz: number)
    {
        super(DrawCommandType.TRANSLATE, color);
        this.object1=command1;
        this.tx=tx;
        this.ty=ty;
        this.tz=tz;
    }
}

export class Scale extends DrawCommand{
    object1: DrawCommand;
    sx: number;
    sy: number;
    sz: number;
    centroid: boolean
    constructor(color: Color, command1: DrawCommand, sx: number, sy: number, sz: number, centroid: boolean)
    {
        super(DrawCommandType.SCALE, color);
        this.object1=command1;
        this.sx=sx;
        this.sy=sy;
        this.sz=sz;
        this.centroid=centroid;
    }
}

export class Rotate extends DrawCommand{
    object1: DrawCommand;
    axisx: number;
    axisy: number;
    axisz: number;
    angle: number;  //radians
    centroid: boolean;
    constructor(color: Color, command1: DrawCommand, axisx: number, axisy: number, axisz: number, angle: number, centroid:boolean)
    {
        super(DrawCommandType.ROTATE, color);
        this.object1=command1;
        this.axisx=axisx;
        this.axisy=axisy;
        this.axisz=axisz;
        this.angle=angle;
        this.centroid=centroid;
    }
}

export class Hull extends DrawCommand{
    objects: DrawCommand[];
    constructor(color: Color, objects: DrawCommand[]){
        super(DrawCommandType.HULL, color);
        this.objects=objects;
    }
}

export class BoundingBox extends DrawCommand{
    objects: DrawCommand|DrawCommand[];
    offsetnx: number;
    offsetpx: number;
    offsetny: number;
    offsetpy: number;
    offsetnz: number;
    offsetpz: number;
    
    constructor(color: Color, objects: DrawCommand[], offsetnx: number, offsetpx: number, offsetny: number, offsetpy: number, offsetnz: number, offsetpz: number){
        super(DrawCommandType.BOUNDINGBOX, color);
        this.objects=objects;
        this.offsetnx=offsetnx;
        this.offsetpx=offsetpx;
        this.offsetny=offsetny;
        this.offsetpy=offsetpy;
        this.offsetnz=offsetnz;
        this.offsetpz=offsetpz;
    }
}


export class Cut extends DrawCommand{
    object1: DrawCommand;
    planeA: number;
    planeB: number;
    planeC: number;
    planeD: number;
    keepPositive: boolean
    constructor(color: Color, object: DrawCommand, A: number, B: number, C: number, D: number, keepPositive: boolean){
        super(DrawCommandType.CUT, color);
        this.object1=object;
        this.planeA=A;
        this.planeB=B;
        this.planeC=C;
        this.planeD=D;
        this.keepPositive=keepPositive;
    }
}



export class Extrude extends DrawCommand{
    polygon: Polygon2D;
    height: number;
    divisions: number;
    twist: number;
    scale: number;
    zcenter: boolean
    constructor(color: Color, polygon: Polygon2D, height: number, divisions: number, twist: number, scale: number, zcenter: boolean){
        super(DrawCommandType.EXTRUDE, color);
        this.polygon=polygon;
        this.height=height;
        this.divisions=divisions;
        this.twist=twist;
        this.scale=scale;
        this.zcenter=zcenter;
    }
}


export class Revolve extends DrawCommand{
    polygon: Polygon2D;
    resolution: number;
    angle: number;
    constructor(color: Color, polygon: Polygon2D, resolution: number, angle: number){
        super(DrawCommandType.EXTRUDE, color);
        this.polygon=polygon;
        this.resolution=resolution;
        this.angle=angle;
    }
}
   