//JH 2025
//A few type definitions so we don't have to pull down
//the Three types from DefinitelyTyped.

export interface Vector3{
    x: number;
    y: number;
    z: number;
    length: () => number;
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

}

export interface Controls{

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

export interface Object3D{
    children: Object3D[];
    matrixWorld: Matrix4;
    parent: Object3D;
    up: Vector3;
    userData: any;
    visible: boolean;
    position: Vector3;
    removeFromParent: ()=>void;
    lookAt: (v: Vector3|number, y?:number, z?:number) => void;
}

export interface Group extends Object3D{
    //nothing else for us here
}

export interface Camera extends Object3D{

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