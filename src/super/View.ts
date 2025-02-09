

//for testing
// let geom = new THREE.BoxGeometry(1,1,1);
// let mtl = new THREE.MeshLambertMaterial({color: 0x00ff00 } );
// let cube = new THREE.Mesh(geom,mtl);
// cube.name="test cube";
// this.scene.add(cube);

import {Mesh} from "Mesh";

// @ts-ignore
import * as THREE from "three";

// @ts-ignore
// import {TrackballControls} from "TrackballControls";

// @ts-ignore
import {OrbitControls} from "OrbitControls";

// @ts-ignore
import {LineSegments2} from "LineSegments2";

// @ts-ignore
import {LineSegmentsGeometry} from "LineSegmentsGeometry";

// @ts-ignore
import {LineMaterial} from "LineMaterial";

import { ErrorReporter } from "./ErrorReporter.js";
import { Editor } from "./Editor.js";
import { Box3, Camera, Group, Material, OrthographicCamera, PerspectiveCamera, Plane, THREEOrbitControls, WebGLRenderer, Vector3 } from "./ThreeTypes.js";

//user data for meshes and other objects
class UserData {
    isMesh: boolean;        //true if it's a Manifold mesh
    constructor(isMesh: boolean){
        this.isMesh=isMesh;
    }
}

type ParameterlessCallback = ()=>void;

export class ClippingPlane{
    A: number;
    B: number;
    C: number;
    D: number;
    constructor(A:number,B:number,C:number,D:number){
        this.A=A;
        this.B=B;
        this.C=C;
        this.D=D;
    }
}

export enum GridPlane{
    XZ, YZ, XY
};

export enum CameraType {
    PERSPECTIVE, ORTHOGRAPHIC
};

class Label{
    worldPoint: Vector3;
    cvs: HTMLCanvasElement;
    elem: HTMLElement;
    elemW: number;
    constructor( parent: HTMLElement, p: Vector3, txt: string){
        this.worldPoint = p;
        this.elem = document.createElement("span");
        parent.appendChild(this.elem);
        this.elem.appendChild(document.createTextNode(txt));
        this.elem.style.position="absolute";
        this.elem.classList.add("label3d");

        //do this after applying css styles
        let r = this.elem.getBoundingClientRect();
        this.elemW = r.width;

        this.cvs = document.createElement("canvas");
        this.cvs.style.position="absolute";
        this.cvs.width=8;
        this.cvs.height=8;
        let ctx = this.cvs.getContext("2d");
        ctx.clearRect(0,0,this.cvs.width,this.cvs.height);
        ctx.fillStyle="#8080ff";
        ctx.strokeStyle="black";
        ctx.arc(this.cvs.width/2, this.cvs.height/2,this.cvs.width/2,0,2*Math.PI);
        ctx.fill();
        ctx.stroke();
        parent.appendChild(this.cvs);
        
    }
    removeDOMElements(){
        this.cvs.parentNode.removeChild(this.cvs);
        this.elem.parentNode.removeChild(this.elem);
    }

    updatePosition(camera:Camera, w: number, h: number){
        let p = new THREE.Vector4(this.worldPoint.x, this.worldPoint.y, this.worldPoint.z,1);
        
        p.applyMatrix4(camera.matrixWorldInverse);
        p.applyMatrix4(camera.projectionMatrix);
        let x = p.x / p.w;
        let y = p.y / p.w;
        y=-y;
        x = (x+1)/2;
        y = (y+1)/2;
        x = x * w;
        y = y * h ;

        let tmp = x-this.elemW/2;
        this.elem.style.left=tmp+"px";
        this.elem.style.top=(y+4)+"px";

        let cx = (x-this.cvs.width/2);
        let cy = (y-this.cvs.height/2);
        this.cvs.style.left=cx+"px";
        this.cvs.style.top=cy+"px";
    }
}


export class View{

    //this is a singleton class, so we hold a reference
    //to its instance here
    private static instance: View;

    //bounding box of objects in scene: A THREE.Box3 object
    //@ts-ignore
    bbox: Box3 = new THREE.Box3( new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0) );

    //parent DOM node
    parent: HTMLElement;

    //the scene to draw: A THREE.Scene object
    scene: any;

    //list of all the meshes we're drawing
    meshes: Mesh[] = [];

    //functions that get called whenever meshes are added to scene
    meshChangeListeners: ParameterlessCallback[] = [];

    //list of all the materials of the meshes (but not materials
    //for view widgets, grids, axes, etc.). This is here
    //because we want to do clipping but we don't want
    //to clip the axes and such
    allMaterials: Material[] = [];
    
    //currently active clipping planes
    clippingPlanes: Plane[] = [];

    //allows us to switch between camera types
    activeCameraType: CameraType = CameraType.PERSPECTIVE;

    //camera and control objects
    perspectiveCamera: PerspectiveCamera;
    perspectiveControls: THREEOrbitControls; //TrackballControls;

    orthoCamera: OrthographicCamera;
    orthoControls: THREEOrbitControls; //TrackballControls;

    //light that is located at the eye
    light: any;

    //light will point at this object (this object
    //is not drawn; it only exists for pointing the light);
    //this is a THREE.Object3D object.
    lightTarget: any;

    //the renderer: Draws the scene: A THREE.WebGLRenderer
    renderer: WebGLRenderer;

    labels: Label[] = [];
    labeldiv: HTMLDivElement;
    labelPositionsAreStale: boolean=true;

    //the coordinate axes: A THREE group
    axes: any;

    //the ground grid (grid along the xy plane)
    gridXY: Group;
    gridYZ: Group;        //THREE group
    gridXZ: Group;        //THREE group
    majorColor: number;
    majorWidth: number;
    majorInterval: number;
    minorColor: number;
    minorWidth: number;
    minorSpacing: number;
    gridExtent: number;

    //raycaster for object picking
    raycaster: any;

    //last mouse position in normalized device coordinates for picking
    // lastMouseX: number = 0;
    // lastMouseY: number = 0;

    //true if the view is stale
    viewIsStale=true;

    private constructor(parent: HTMLElement){
        this.parent=parent;

        this.renderer = new THREE.WebGLRenderer({antialias:true} );
        this.renderer.setSize(16,16,false);   //dummy
        this.renderer.localClippingEnabled=true;


        //we want to intercept some mouse events before the orbitcontrol has a chance
        //to see them.
        this.renderer.domElement.addEventListener("pointerdown", (ev: MouseEvent)=>{
            if( ev.button === 0 && ev.ctrlKey ){
                //intercept the event and don't let it get to the controls
                ev.stopImmediatePropagation();  
                ev.preventDefault();
                let x = -1 + 2 * ev.offsetX / this.renderer.domElement.width;
                let y = -(-1 + 2 * ev.offsetY / this.renderer.domElement.height);
                this.showPointUnderMouse(x,y);
            }
        });

        let labeldiv1 = document.createElement("div");
        labeldiv1.style.position="relative";
        labeldiv1.style.left="0px";
        labeldiv1.style.top="0px";
        parent.insertBefore(labeldiv1,parent.firstChild);
        this.labeldiv = document.createElement("div");
        labeldiv1.appendChild(this.labeldiv);
        this.labeldiv.style.position="absolute";
        this.labeldiv.style.left="0px";
        this.labeldiv.style.top="0px";
        this.labeldiv.style.pointerEvents="none";
        this.labeldiv.style.width="100%";
        this.labeldiv.style.height="100vh";
        //@ts-ignore
        this.labeldiv.style.zIndex=2;


        // this.labelRenderer = new CSS2DRenderer(labeldiv);
        // this.labelRenderer.setSize(16,16);        //dummy
        // this.labelRenderer.domElement.style.position="absolute";

        this.perspectiveCamera = new THREE.PerspectiveCamera( 
            45, //fov
            1.0,    //aspect ratio
            0.1,        //hither
            1000        //yon
        );
        this.perspectiveCamera.up = new THREE.Vector3(0,0,1);   //so controls knows which way is up

        this.orthoCamera = new THREE.OrthographicCamera(
            -1,1, 1,-1, -1000, 1000
        )
        this.orthoCamera.zoom=0.2;
        this.orthoCamera.up = new THREE.Vector3(0,0,1);


        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        let amb = new THREE.AmbientLight(0x808080);
        amb.name="ambient light";
        amb.userData = new UserData(false);
        this.scene.add(amb);

        this.lightTarget = new THREE.Object3D();
        this.lightTarget.userData = new UserData(false);
        this.scene.add(this.lightTarget);

        this.light = new THREE.DirectionalLight(
            0xffffff, //color
            4.0     //intensity
        );
        this.scene.add(this.light);
        this.light.target = this.lightTarget;

        // this.light = new THREE.PointLight(
        //     0xffffff,   //color
        //     4,          //intensity
        //     0,          //max distance
        //     0           //decay
        // );
        this.light.userData = new UserData(false);
        this.light.name="moving light";


        this.makeGrids(
            0xa0a0a0, 0.5, 10,
            0xddddff, 0.5, 1,
            200,
            true,false,false
        );

        //axes
        this.axes = new THREE.Group();
        this.axes.name = "axes";
        this.axes.userData = new UserData(false);
        this.scene.add(this.axes);
        let axp = [ [1,0,0], [0,1,0], [0,0,1] ];
        let col = [ 0xff0000, 0x00ff00, 0x0000ff ];
        for(let i=0;i<3;++i){
            let geo = new LineSegmentsGeometry();
            geo.setPositions( [ 0,0,0, axp[i][0]*100, axp[i][1]*100, axp[i][2]*100 ] );
            let mtl = new LineMaterial({
                color: col[i], 
                linewidth: 3
            });
            let axis = new LineSegments2(geo,mtl);
            this.axes.add(axis);

            
            // let geo = new THREE.BufferGeometry();
            // geo.setFromPoints( 
            //         [ 
            //         new THREE.Vector3(0,0,0), 
            //         new THREE.Vector3(
            //             axp[i][0]*100,
            //             axp[i][1]*100,
            //             axp[i][2]*100
            //         )
            //     ]
            // );
            // let axis = new THREE.Line(geo,new THREE.LineBasicMaterial({
            //     color: col[i], linewidth: 3}));
            // axis.name="axis"+i;
            // this.axes.add(axis);
        }

        //@ts-ignore
        this.perspectiveControls = new OrbitControls(this.perspectiveCamera,this.renderer.domElement);
        this.perspectiveControls.listenToKeyEvents( window );
        this.perspectiveControls.enableDamping=false;

        // this.perspectiveControls = new TrackballControls(this.perspectiveCamera,this.renderer.domElement);
        // this.perspectiveControls.staticMoving=true;

        //this.perspectiveControls.rotateSpeed=2.0;
        this.perspectiveControls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY
        };
        
        //@ts-ignore
        this.orthoControls = new OrbitControls(this.orthoCamera,this.renderer.domElement);
        this.orthoControls.listenToKeyEvents( window );
        this.orthoControls.enableDamping=false;

        //this.orthoControls = new TrackballControls(this.orthoCamera,this.renderer.domElement);
        //this.orthoControls.staticMoving=true;
        
        //this.orthoControls.rotateSpeed=2.0;
        //this.orthoControls.panSpeed=10.0;
        this.orthoControls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY
        };
        
        parent.appendChild(this.renderer.domElement);

        this.perspectiveControls.addEventListener("change",()=>{
            this.viewIsStale=true;
            this.labelPositionsAreStale=true;
        });

        // this.renderer.domElement.addEventListener( "pointermove", 
        //     (ev: PointerEvent) => {
        //         //domElement is a canvas
        //         //map 0...w to range -1...1
        //         this.lastMouseX = -1 + 2 * ev.offsetX / this.renderer.domElement.width;
        //         this.lastMouseY = -(-1 + 2 * ev.offsetY / this.renderer.domElement.height);
        //     }
        // );

        // ["over","enter","down","move","up","cancel","out","leave"].forEach( (evname:string) => {
        //     this.renderer.domElement.addEventListener("pointer"+evname, () => {
        //         this.viewIsStale=true;
        //     })
        // });
        
        // ["wheel","mousewheel"].forEach( (evname: string) => {
        //     this.renderer.domElement.addEventListener(evname, () => {
        //         this.viewIsStale=true;
        //     })
        // });

        // ["keydown","keyup"].forEach( (evname: string) => {
        //     window.addEventListener(evname, () => {
        //         this.viewIsStale=true;
        //     })
        // });


        //if the user clicks on the view, we want to take focus
        //away from the editor
        //on Linux, for example, a middle mouse press is 
        //sent to the text editor as a paste operation if we don't
        //handle this
        this.renderer.domElement.addEventListener( "mousedown", (ev: MouseEvent) => {
            Editor.get().blur();
            ev.preventDefault();        //prevent editor from getting middle mouse event
        } );

        this.lookAt( 5.5, -5, 5, 0,0,0, 0,0,1);

        this.resize();
        this.draw();

        //requestAnimationFrame pegs the cpu in my tests;
        //we don't need that, so we throttle the rate a bit
        //ref: https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe
        // let nextDrawTime = 0;
        let periodicFunc =  (timestamp: DOMHighResTimeStamp) => {
            requestAnimationFrame(periodicFunc);
            if( this.viewIsStale ){ //timestamp >= nextDrawTime ){
                // nextDrawTime = timestamp + 30;
                // this.controls.update;
                this.draw();    
            }
        };
        periodicFunc(0);


        this.raycaster = new THREE.Raycaster();

        // document.addEventListener("keydown", (ev: KeyboardEvent) => {
        //     if( document.activeElement === document.body ){
        //         switch(ev.key){
        //             default:
        //                 break;
        //         }
        //     }
        // });

    } // constructor


    addLabel(pos: Vector3, txt: string){
        this.labels.push( new Label(this.labeldiv, pos, txt));
        this.labelPositionsAreStale=true;
        this.draw();
    }

    clearLabels(){
        this.labels = [];
        while(this.labeldiv.childNodes.length > 0 ){
            this.labeldiv.removeChild( this.labeldiv.firstChild);
        }
        this.labelPositionsAreStale=true;
    }

    recomputeLabelPositions(){
        if( !this.labelPositionsAreStale)
            return;

        this.labelPositionsAreStale=false;
        let c = this.getCamera();
        if(!c){
            console.warn("No camera?");
            return;
        }
        this.labels.forEach( (L: Label) => {
            L.updatePosition(c, this.renderer.domElement.width,  this.renderer.domElement.height);
        });
    }

    showPointUnderMouse(x:number,y:number){
        //x,y are in normalized -1...1 coordinates, not pixel coordinates

        this.clearLabels();

        //ref: https://threejs.org/docs/#api/en/core/Raycaster
        let p = new THREE.Vector2(x,y);
        console.log("Testing with p=",p);
        this.raycaster.setFromCamera( p, this.getCamera() );
        let intersections = this.raycaster.intersectObjects( this.scene.children );
        //intersections is a list, sorted by distance. Each entry
        //has these fields:
        //distance
        //point (in world coordinates): Vector3
        //face
        //faceIndex
        //object (the intersected object)
        //uv (uv coordinates)
        //uv1 (second uv coords)
        //normal
        //instanceId (for instanced meshes)
        
        //only consider manifoldmesh objects
        //and discard anything that a clipping plane rejects
        // console.log(intersections);
        for(let i=0;i<intersections.length;++i){
            let I = intersections[i];
            if( I.object && I.object.userData && (I.object.userData as UserData).isMesh ){
                let keep=true;
                for(let j=0;j<this.clippingPlanes.length;++j){
                    if( this.clippingPlanes[j].distanceToPoint(I.point) < 0 ){
                        keep=false;
                        break;
                    }
                }
                if(!keep)
                    continue;

                let s="";
                if( I.object.name && I.object.name.length > 0 )
                    s += I.object.name+": ";
                s += `( ${I.point.x} , ${I.point.y} , ${I.point.z} )`;
                ErrorReporter.get().addMessage( s );
                ErrorReporter.get().scrollToBottom();

                let ptxt = `${I.point.x.toFixed(3)} , ${I.point.y.toFixed(3)} , ${I.point.z.toFixed(3)}`;
                this.addLabel( I.point, ptxt );

                return;
            }
        }
        ErrorReporter.get().addMessage( "No visible point under the mouse" );
        ErrorReporter.get().scrollToBottom();
        return;
    }
    
    isGridVisible(which: GridPlane ){
        switch(which){
            case GridPlane.XY:
                return this.gridXY !== undefined;
            case GridPlane.XZ:
                return this.gridXZ !== undefined;
            case GridPlane.YZ:
                return this.gridYZ !== undefined;
            default:
                throw new Error();
        }
    }

    makeGrids(majorColor:number, majorWidth:number, majorInterval:number,
        minorColor:number, minorWidth:number, minorSpacing:number,
        gridExtent:number, xy: boolean, xz: boolean, yz: boolean){

        this.majorColor=majorColor;
        this.majorWidth=majorWidth;
        this.majorInterval=majorInterval;
        this.minorColor=minorColor;
        this.minorWidth=minorWidth;
        this.minorSpacing=minorSpacing;
        this.gridExtent=gridExtent;

        if(this.gridXY){
            this.gridXY.removeFromParent();
            this.gridXY=undefined;
        }
        if( xy ){
            this.gridXY = this.makeGrid(
                majorColor, majorWidth, majorInterval,
                minorColor, minorWidth, minorSpacing,
                gridExtent, GridPlane.XY
            );
            this.scene.add(this.gridXY);
        }

        if(this.gridXZ){
            this.gridXZ.removeFromParent();
            this.gridXZ=undefined;
        }
        if( xz ){
            this.gridXZ = this.makeGrid(
                majorColor, majorWidth, majorInterval,
                minorColor, minorWidth, minorSpacing,
                gridExtent, GridPlane.XZ
            );
            this.scene.add(this.gridXZ);
        }
        
        if(this.gridYZ){
            this.gridYZ.removeFromParent();
            this.gridYZ=undefined;
        }
        if( yz ){
            this.gridYZ = this.makeGrid(
                majorColor, majorWidth, majorInterval,
                minorColor, minorWidth, minorSpacing,
                gridExtent, GridPlane.YZ
            );
            this.scene.add(this.gridYZ);
        }
        this.draw();
    }
     
    private makeGrid( majorColor:number, majorWidth:number, majorInterval:number,
        minorColor:number, minorWidth:number, minorDistance:number,
        gridExtent:number, gridType:GridPlane) {



        let majorMtl:any = new LineMaterial({color:majorColor, linewidth: majorWidth});
        let minorMtl:any = new LineMaterial({color:minorColor, linewidth: minorWidth});
        let majorLines: number[] = [];
        let minorLines: number[] = [];
        for(let i=-gridExtent,j=0;i<=gridExtent;i+=minorDistance,j++){
            let idx: number;
            let L: any[];
            if( j === majorInterval ){
                j=0;
                L=majorLines;
            } else {
                L=minorLines;
            }

            switch(gridType){
                case GridPlane.XY:
                    L.push(i);              L.push(-gridExtent); L.push(0);
                    L.push(i);              L.push( gridExtent); L.push(0);
                    L.push(-gridExtent);    L.push(i);           L.push(0);
                    L.push( gridExtent);    L.push(i);           L.push(0);
                    // L.push( new THREE.Vector3(   i,         -gridExtent, 0) );
                    // L.push( new THREE.Vector3(   i,         gridExtent,  0) );
                    // L.push( new THREE.Vector3(-gridExtent,   i,          0) );
                    // L.push( new THREE.Vector3( gridExtent,   i,          0));
                    break;
                case GridPlane.YZ:
                    L.push(0);    L.push(i);            L.push(-gridExtent);
                    L.push(0);    L.push(i);            L.push(gridExtent);
                    L.push(0);    L.push(-gridExtent);  L.push(i);
                    L.push(0);    L.push(gridExtent);   L.push(i);
                    // L.push( new THREE.Vector3(  0,  i,          -gridExtent) );
                    // L.push( new THREE.Vector3(  0,  i,           gridExtent) );
                    // L.push( new THREE.Vector3(  0,  -gridExtent,  i) );
                    // L.push( new THREE.Vector3(  0,   gridExtent,  i));
                    break;
                case GridPlane.XZ:
                    L.push(i);              L.push(0);  L.push(-gridExtent);
                    L.push(i);              L.push(0);  L.push(gridExtent);
                    L.push(-gridExtent);    L.push(0);  L.push(i);
                    L.push( gridExtent);    L.push(0);  L.push(i);
                    // L.push( new THREE.Vector3(  i,           0, -gridExtent) );
                    // L.push( new THREE.Vector3(  i,           0,  gridExtent) );
                    // L.push( new THREE.Vector3(  -gridExtent, 0,  i) );
                    // L.push( new THREE.Vector3(   gridExtent, 0,  i));
                    break;
                default:
                    throw new Error();
            }
        }
        let grp = new THREE.Group();
        grp.name = "grid";
        

        let geo = new LineSegmentsGeometry();
        geo.setPositions(majorLines);
        let m = new LineSegments2(geo,majorMtl);
        grp.add(m);

        geo = new LineSegmentsGeometry();
        geo.setPositions(minorLines);
        m = new LineSegments2(geo,minorMtl);
        grp.add(m);

        // let geo = new THREE.BufferGeometry();
        // geo.setFromPoints(majorLines);
        // let m = new THREE.LineSegments(geo,majorMtl);
        // m.name="gridLine";
        // grp.add(m);

        // geo = new THREE.BufferGeometry();
        // geo.setFromPoints(minorLines);
        // m = new THREE.LineSegments(geo,minorMtl);
        // m.name="gridLine";
        // grp.add(m);

        grp.userData = new UserData(false);
        return grp;
    }

    lookAt( eyex:number, eyey:number, eyez:number, 
            coix:number, coiy:number, coiz:number, 
            upx:number, upy:number, upz:number) {
        let c = new THREE.Vector3(coix,coiy,coiz);
        [ [this.perspectiveCamera,this.perspectiveControls], [this.orthoCamera,this.orthoControls] ].forEach( (tmp: [Camera,OrbitControls] ) => {
            let cam = tmp[0];
            let cont = tmp[1];
            if(!cam || !cont )
                return;
            cam.up.set(upx,upy,upz);
            cont.reset();
            cam.position.set(eyex,eyey,eyez);
            cont.target.set(coix,coiy,coiz);
            cont.update();
        });
        this.draw();
    }
    
    areAxesVisible(){
        return this.axes.visible;
    }

    setAxesVisible(b: boolean){
        this.axes.visible = b;
        this.draw();
    }

    toggleAxesVisible(){
        this.setAxesVisible(!this.axes.visible);
        return this.axes.visible;
    }

    draw(){

        let controls = this.getControls();
        let camera = this.getCamera();

        if(!controls || !camera)
            return;
        
        controls.update();

        //must do this after updating controls
        this.recomputeLabelPositions();

        if( this.light ){
            let p = camera.position;
            let W = camera.matrixWorld;
            let v = new THREE.Vector4(0,0,-1,0);
            v.applyMatrix4(W);  //get camera's view direction
            let v3 = new THREE.Vector3(v.x,v.y,v.z);
            //pfront is in front of the camera
            let pfront = new THREE.Vector3(p.x,p.y,p.z);
            pfront.add( v3 );

            this.light.position.set( p.x, p.y, p.z );
            this.lightTarget.position.set( pfront.x, pfront.y, pfront.z );
        }

        this.renderer.render(this.scene, camera );
        this.viewIsStale=false;
    }

    resize(){

        let rect = this.parent.getBoundingClientRect();
        this.renderer.setSize( rect.width, rect.height, false);

        this.labelPositionsAreStale=true;
        
        this.perspectiveCamera.aspect = rect.width/rect.height;
        this.perspectiveCamera.updateProjectionMatrix();
        
        let aspect = rect.height/rect.width;
        this.orthoCamera.top = aspect;
        this.orthoCamera.bottom = -aspect;
        this.orthoCamera.updateProjectionMatrix();

        this.draw();
    }

    static initialize(parent: HTMLElement){
        if(!View.instance)
            View.instance = new View(parent);
    }

    static get(): View {
        return View.instance;
    }

    getMeshes(): Mesh[] {
        return this.meshes;
    }
    
    setMeshes(meshes: Mesh[]) {

        this.clearLabels();

        //can't remove while iterating
        let toRemove: any[] = [];

        this.scene.children.forEach( (c: any) => {
            if( c.userData && (c.userData as UserData).isMesh ){
                toRemove.push(c);
            }
        });

        toRemove.forEach( (c: any) => {
            //c.removeFromParent();
            this.scene.remove(c);
        });
        this.allMaterials=[];

        //bounding box for the meshes
        let bbminx=Infinity; 
        let bbminy=Infinity;
        let bbminz=Infinity;
        let bbmaxx=-Infinity; 
        let bbmaxy=-Infinity;
        let bbmaxz=-Infinity;
      
        this.meshes = meshes;

        meshes.forEach( (m: Mesh) => {
            let v=m.vertices;
            let geo = new THREE.BufferGeometry();
            //NOTE: setIndex needs a buffer attribute, not the raw list of vertices.
            //This seems to be an error in the Three.js documentation.
            geo.setAttribute("position",new THREE.BufferAttribute(v, 3) );
            geo.computeVertexNormals();
            let color = m.color;
            if( color === undefined )
                color=[0x00, 0xcc, 0xff];
            let c = color[0] << 16 ;
            c |= color[1] << 8;
            c |= color[2] ;
            let mtl: Material = new THREE.MeshLambertMaterial( { color: c } );
            this.allMaterials.push(mtl);
            mtl.clippingPlanes = this.clippingPlanes;
            mtl.side = THREE.DoubleSide;
            if( color.length === 4 ){
                mtl.transparent=true;
                mtl.opacity = color[3]/255;
            }
            let m3 = new THREE.Mesh(geo,mtl);
            m3.name = m.name ?? "";
            m3.userData = new UserData(true);
            this.scene.add(m3);

            //not using geo.computeBoundingBox()...
            for(let i=0;i<v.length;){
                bbminx = Math.min(bbminx,v[i]);
                bbmaxx = Math.max(bbmaxx,v[i]);
                i++;
                bbminy = Math.min(bbminy,v[i]);
                bbmaxy = Math.max(bbmaxy,v[i]);
                i++;
                bbminz = Math.min(bbminz,v[i]);
                bbmaxz = Math.max(bbmaxz,v[i]);
                i++;
            }
        }); //end for each meshes

        if( bbminx == -Infinity ){
            //we didn't have any objects?
            bbminx = bbminy = bbminz = 0;
            bbmaxx = bbmaxy = bbmaxz = 0;
        }

        this.bbox = new THREE.Box3(new THREE.Vector3(bbminx,bbminy,bbminz),
                                   new THREE.Vector3(bbmaxx,bbmaxy,bbmaxz));

        this.draw();

        this.meshChangeListeners.forEach( (f: ParameterlessCallback) => {
            f();
        });

    }

    getBoundingBox(){
        return this.bbox;
    }

    getCamera(){
        switch(this.activeCameraType){
            case CameraType.PERSPECTIVE:
                return this.perspectiveCamera;
            case CameraType.ORTHOGRAPHIC:
                return this.orthoCamera;
            default:
                throw new Error("Bad camera type");
        }
    }

    getControls(){
        switch(this.activeCameraType){
            case CameraType.PERSPECTIVE:
                return this.perspectiveControls;
            case CameraType.ORTHOGRAPHIC:
                return this.orthoControls;
            default:
                throw new Error("Bad camera type");
        }
    }

    getCameraType(){
        return this.activeCameraType;
    }

    setCameraType(ctype: CameraType){
        this.activeCameraType = ctype;
        this.labelPositionsAreStale=true;
        this.draw();
    }

    lookDownAxis(x: number, y: number, z: number){
        let p = this.getCamera().position;
        let dist = p.length();
        let ux,uy,uz;
        if( z === 1 || z === -1 ){
            ux=0;
            uy=1;
            uz=0;
        } else {
            ux=0;
            uy=0;
            uz=1;
        }

        let ex=dist*x;
        let ey=dist*y;
        let ez=dist*z;
        this.lookAt(ex,ey,ez,
            0,0,0,
            ux,uy,uz
        );

    }

    setClippingPlanes( planes: ClippingPlane[]){
        this.clippingPlanes=[];
        planes.forEach( (p: ClippingPlane) => {
            let n = new THREE.Vector3(p.A,p.B,p.C);
            n.normalize();
            this.clippingPlanes.push( new THREE.Plane(n,p.D) );
        });
        this.allMaterials.forEach( (m: Material) => {
            m.clippingPlanes = this.clippingPlanes;
        });
        this.draw();
    }

    //f will be called whenever meshes are changed
    registerMeshChangeListener( f: ParameterlessCallback ) {
        this.meshChangeListeners.push(f);
    };

}


