//JH 2025
//A few type definitions so we don't have to pull down
//the Three types from DefinitelyTyped.


export interface WebGLRenderer{
    domElement: HTMLCanvasElement;
    setSize: (width:number, height: number, updateStyle: boolean) => void;
    localClippingEnabled: boolean;
    render: (scene:Object3D, camera: Camera) => void;
}

export interface THREECSS2DRenderer{
    setSize: (width: number, height: number) => void;
    domElement: HTMLElement;
    render: (scene:Scene, camera: Camera) => void;

}

export interface Vector3{
    x: number;
    y: number;
    z: number;
    length: () => number;
    set: (x:number, y:number, z:number) => void;
}

export interface Box3{
    min: Vector3;
    max: Vector3;
}

export interface Plane{
    normal: Vector3;
    constant: number;
    distanceToPoint: (p:Vector3) => number;
}

export interface Matrix4{
    identity: ()=>void;
}

export interface EventDispatcher{
    addEventListener: (type:string, listener: any) => void;
}

export interface Controls extends EventDispatcher{

}

export interface Material{
    clippingPlanes: Plane[];
    side: number;
    transparent: boolean;
    opacity: number;
}

export interface TrackballControls extends Controls{
    staticMoving: boolean;
    keys: any[];
    mouseButtons: any;
    panSpeed: number;
    rotateSpeed: number;
    zoomSpeed: number;
    handleResize: () => void;
}

export interface THREEOrbitControls extends Controls{
    listenToKeyEvents: (elem: any) => void;
    enableDamping: boolean;
    mouseButtons: any;
    update: ()=>void;

}

export interface Euler{
    set: (x:number,y:number,z:number, order?:string) => Euler;
}

export interface Object3D{
    children: Object3D[];
    matrixWorld: Matrix4;
    parent: Object3D;
    up: Vector3;
    userData: any;
    visible: boolean;
    position: Vector3;
    matrix:Matrix4;
    rotation: Euler;
    scale: Vector3;
    removeFromParent: ()=>void;
    lookAt: (v: Vector3|number, y?:number, z?:number) => void;
    updateMatrix: ()=>void;
}


export interface Scene extends Object3D{
}

export interface Group extends Object3D{
    //nothing else for us here
}

export interface Camera extends Object3D{
    matrixWorldInverse: Matrix4;
    updateProjectionMatrix: ()=>void;   //THREE puts this in the subclasses, but it's common to both
    projectionMatrix: ()=>Matrix4;
}

export interface PerspectiveCamera extends Camera{
    aspect:number;
    updateProjectionMatrix: ()=>void;
}

export interface OrthographicCamera extends Camera{
    left: number;
    right: number;
    top: number;
    bottom: number;
    zoom: number;
    updateProjectionMatrix: ()=>void;
}