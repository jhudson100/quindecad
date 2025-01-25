//FIXME: Allow orthographic/perspective view toggle
//FIXME: Allow user to click edge and then show statistics (length, endpoints) of that edge
//FIXME: Add wireframe display option: solid, solid+wireframe, wireframe only
//FIXME: Use +,- to change rotateSpeed and panSpeed on orbitcontrols. Or put slider on screen
//FIXME: Allow a user-specified clipping plane for viewing interior of objects: https://stackoverflow.com/questions/43916002/three-js-how-to-cut-a-3d-object-with-y-plane

import {Mesh} from "Mesh";

// @ts-ignore
import * as THREE from "three";

// @ts-ignore
import {TrackballControls} from "TrackballControls";
// @ts-ignore
import {OrbitControls} from "OrbitControls";

import { ErrorReporter } from "ErrorReporter";
import { Editor } from "Editor";

//user data for meshes and other objects
class UserData {
    isMesh: boolean;        //true if it's a Manifold mesh
    constructor(isMesh: boolean){
        this.isMesh=isMesh;
    }
}

export enum GridPlane{
    XZ, YZ, XY
};

export enum CameraType {
    PERSPECTIVE, ORTHOGRAPHIC
};

export class View{

    //this is a singleton class, so we hold a reference
    //to its instance here
    private static instance: View;

    //parent DOM node
    parent: HTMLElement;

    //the scene to draw. 
    scene: any;

    //list of all the meshes we're drawing
    meshes: Mesh[] = [];

    //allows us to switch between camera types
    activeCameraType: CameraType = CameraType.PERSPECTIVE;

    //camera and control objects
    perspectiveCamera: any;
    perspectiveControls: any;

    orthoCamera: any;
    orthoControls: any;

    //light that is located at the eye
    light: any;

    //light will point at this object (this object
    //is not drawn; it only exists for pointing the light);
    lightTarget: any;

    //the renderer: Draws the scene
    renderer: any;

    //the coordinate axes
    axes: any;

    //the ground grid (grid along the xy plane)
    gridXY: any;
    gridYZ: any;
    gridXZ: any;
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
    lastMouseX: number = 0;
    lastMouseY: number = 0;

    //true if the view is stale
    viewIsStale=true;

    private constructor(parent: HTMLElement){
        this.parent=parent;

        this.renderer = new THREE.WebGLRenderer({antialias:true} );
        this.renderer.setSize(16,16);   //dummy

        this.perspectiveCamera = new THREE.PerspectiveCamera( 
            45, //fov
            1.0,    //aspect ratio
            0.1,        //hither
            1000        //yon
        );

        this.orthoCamera = new THREE.OrthographicCamera(
            -1,1, 1,-1, -1000, 1000
        )

        //must set this before we create the Controls object
        this.lookAt( 5,-5,5, 0,0,0, 0,0,1);

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
            let geo = new THREE.BufferGeometry();
            geo.setFromPoints( 
                    [ 
                    new THREE.Vector3(0,0,0), 
                    new THREE.Vector3(
                        axp[i][0]*100,
                        axp[i][1]*100,
                        axp[i][2]*100
                    )
                ]
            );
            let axis = new THREE.Line(geo,new THREE.LineBasicMaterial({
                color: col[i], linewidth: 3}));
            axis.name="axis"+i;
            this.axes.add(axis);
        }

        //TODO: Make these controls configurable
        //this.perspectiveControls = new OrbitControls(this.perspectiveCamera,this.renderer.domElement);
        //this.perspectiveControls.listenToKeyEvents( window );
        // this.perspectiveControls.enableDamping=false;

        this.perspectiveControls = new TrackballControls(this.perspectiveCamera,this.renderer.domElement);
        this.perspectiveControls.staticMoving=true;
        this.perspectiveControls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY
        };
        
        // this.orthoControls = new OrbitControls(this.orthoCamera,this.renderer.domElement);
        // this.orthoControls.listenToKeyEvents( window );
        // this.orthoControls.enableDamping=false;

        this.orthoControls = new TrackballControls(this.orthoCamera,this.renderer.domElement);
        this.orthoControls.staticMoving=true;
        this.orthoControls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY
        };
        
        parent.appendChild(this.renderer.domElement);

        //ref: https://threejs.org/docs/#api/en/core/Raycaster
        this.renderer.domElement.addEventListener( "pointermove", 
            (ev: PointerEvent) => {
                //domElement is a canvas
                //map 0...w to range -1...1
                this.lastMouseX = -1 + 2 * ev.offsetX / this.renderer.domElement.width;
                this.lastMouseY = -(-1 + 2 * ev.offsetY / this.renderer.domElement.height);
            }
        );

        ["over","enter","down","move","up","cancel","out","leave"].forEach( (evname:string) => {
            this.renderer.domElement.addEventListener("pointer"+evname, () => {
                this.viewIsStale=true;
            })
        });
        
        ["wheel","mousewheel"].forEach( (evname: string) => {
            this.renderer.domElement.addEventListener(evname, () => {
                this.viewIsStale=true;
            })
        });

        ["keydown","keyup"].forEach( (evname: string) => {
            window.addEventListener(evname, () => {
                this.viewIsStale=true;
            })
        });

        //if the user clicks on the view, we want to take focus
        //away from the editor
        //on Linux, for example, a middle mouse press is 
        //sent to the text editor as a paste operation if we don't
        //handle this
        this.renderer.domElement.addEventListener( "mousedown", (ev: MouseEvent) => {
            Editor.get().blur();
            ev.preventDefault();        //prevent editor from getting middle mouse event
        } );
        // this.renderer.domElement.addEventListener( "mouseup", (ev: MouseEvent) => {
        //     console.log("mouseup!")
        //     // ev.preventDefault();
        // } );

        //for testing
        // let geom = new THREE.BoxGeometry(1,1,1);
        // let mtl = new THREE.MeshLambertMaterial({color: 0x00ff00 } );
        // let cube = new THREE.Mesh(geom,mtl);
        // cube.name="test cube";
        // this.scene.add(cube);

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

        document.addEventListener("keydown", (ev: KeyboardEvent) => {
            if( document.activeElement === document.body ){
                switch(ev.key){
                    // case "g":
                    //     this.toggleGrid();
                    //     return;
                    // case "a":
                    //     this.toggleAxes();
                    //     return;
                    // case "o":
                    //     this.camera = this.orthoCamera;
                    //     this.controls = this.orthoControls;
                    //     break;
                    case "p":
                    {
                        let p = new THREE.Vector2(this.lastMouseX,this.lastMouseY);
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
                        // console.log(intersections);
                        for(let i=0;i<intersections.length;++i){
                            let I = intersections[i];
                            if( I.object && I.object.userData && (I.object.userData as UserData).isMesh ){
                                let s="";
                                if( I.object.name && I.object.name.length > 0 )
                                    s += I.object.name+": ";
                                s += `( ${I.point.x} , ${I.point.y} , ${I.point.z} )`;
                                ErrorReporter.get().addMessage( s );
                                ErrorReporter.get().scrollToBottom();
                                return;
                            }
                        }
                        return;
                    }
                    //FIXME: This doesn't work right; needs work
                    // case "1":
                    // case "3":
                    // case "7":
                    //     let p = this.camera.position;
                    //     let distanceFromOrigin = p.length();
                    //     if( ev.key === "1" ){
                    //         //on -y axis
                    //         this.camera.position.x = 0;
                    //         this.camera.position.y = -distanceFromOrigin;
                    //         this.camera.position.z = 0;
                    //         this.camera.up.x = 0;
                    //         this.camera.up.y = 0;
                    //         this.camera.up.z = 1;
                    //     } else if( ev.key === "3"){
                    //         //on +x axis
                    //         this.camera.position.x = distanceFromOrigin;;
                    //         this.camera.position.y = 0;
                    //         this.camera.position.z = 0;
                    //         this.camera.up.x = 0;
                    //         this.camera.up.y = 0;
                    //         this.camera.up.z = 1;
                    //     } else {
                    //         //on +z axis
                    //         this.camera.position.x = 0;
                    //         this.camera.position.y = 0;
                    //         this.camera.position.z = distanceFromOrigin;
                    //         this.camera.up.x = 0;
                    //         this.camera.up.y = 1;
                    //         this.camera.up.z = 0;
                    //     }

                    //     //must be after setting 'up'
                    //     this.camera.lookAt(0,0,0);

                    //     //must do last
                    //     this.camera.updateProjectionMatrix();
                    //     this.draw();

                    //     console.log("eye:",this.camera.position);
                    //     console.log("up:",this.camera.up);
                    //     return;
                    //     //end case
                    default:
                        break;
                }
            }
        });

    } // constructor

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
        let majorMtl:any = new THREE.LineBasicMaterial({color:majorColor, linewidth: majorWidth});
        let minorMtl:any = new THREE.LineBasicMaterial({color:minorColor, linewidth: minorWidth});
        let majorLines: any[] = [];
        let minorLines: any[] = [];
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
                    L.push( new THREE.Vector3(   i,         -gridExtent, 0) );
                    L.push( new THREE.Vector3(   i,         gridExtent,  0) );
                    L.push( new THREE.Vector3(-gridExtent,   i,          0) );
                    L.push( new THREE.Vector3( gridExtent,   i,          0));
                    break;
                case GridPlane.YZ:
                    L.push( new THREE.Vector3(  0,  i,          -gridExtent) );
                    L.push( new THREE.Vector3(  0,  i,           gridExtent) );
                    L.push( new THREE.Vector3(  0,  -gridExtent,  i) );
                    L.push( new THREE.Vector3(  0,   gridExtent,  i));
                    break;
                case GridPlane.XZ:
                    L.push( new THREE.Vector3(  i,           0, -gridExtent) );
                    L.push( new THREE.Vector3(  i,           0,  gridExtent) );
                    L.push( new THREE.Vector3(  -gridExtent, 0,  i) );
                    L.push( new THREE.Vector3(   gridExtent, 0,  i));
                    break;
                default:
                    throw new Error();
            }
        }
        let grp = new THREE.Group();
        grp.name = "grid";
        
        let geo = new THREE.BufferGeometry();
        geo.setFromPoints(majorLines);
        let m = new THREE.LineSegments(geo,majorMtl);
        m.name="gridLine";
        grp.add(m);

        geo = new THREE.BufferGeometry();
        geo.setFromPoints(minorLines);
        m = new THREE.LineSegments(geo,minorMtl);
        m.name="gridLine";
        grp.add(m);

        grp.userData = new UserData(false);
        return grp;
    }

    lookAt( eyex:number, eyey:number, eyez:number, 
            coix:number, coiy:number, coiz:number, 
            upx:number, upy:number, upz:number) {

        let e = new THREE.Vector3(eyex,eyey,eyez);
        let c = new THREE.Vector3(coix,coiy,coiz);
        let u = new THREE.Vector3(upx,upy,upz);
        let look = new THREE.Vector3();
        look.subVectors(c,e);
        look.normalize();
        u.normalize();
        let cp = new THREE.Vector3();
        cp.crossVectors( look,u );
        if( cp.length() < 0.01 ){
            console.warn("look and up vectors are nearly (anti)parallel");
            u = new THREE.Vector3(0,-1,0);
        }

        [this.perspectiveCamera,this.orthoCamera].forEach( (cam: any) => {
            cam.position.set(eyex,eyey,eyez);
            cam.up.set(u.x,u.y,u.z);
            cam.lookAt(coix,coiy,coiz);
            cam.updateProjectionMatrix();
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

        let p = camera.position;

        //we take the camera's view direction and go backwards along that
        //by a large distance to set the light's position
        //The light's target is then set to the camera's position
        //so it will shine parallel to the camera's look vector.
        if( this.light ){
            let W = camera.matrixWorld;
            let v = new THREE.Vector4(0,0,-1,0);
            v.applyMatrix4(W);
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
        console.log("RESIZE");
        
        this.perspectiveControls.handleResize();
        this.orthoControls.handleResize();


        let rect = this.parent.getBoundingClientRect();
        this.renderer.setSize( rect.width, rect.height);

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

        this.meshes = meshes;

        meshes.forEach( (m: Mesh) => {
            let v=m.vertices;
            let geo = new THREE.BufferGeometry();
            //NOTE: setIndex needs a buffer attribute, not the raw list of vertices.
            //This seems to be an error in the Three.js documentation.
            geo.setAttribute("position",new THREE.BufferAttribute(v, 3) );
            geo.computeVertexNormals();
            let mtl: any;
            if( m.color === undefined ){
                mtl = new THREE.MeshLambertMaterial( { color: 0x00ccff } );
            } else {
                let c = m.color[0] << 16 ;
                c |= m.color[1] << 8;
                c |= m.color[2] ;
                mtl = new THREE.MeshLambertMaterial( { color: c } );
                if( m.color.length === 4 ){
                    mtl.transparent=true;
                    mtl.opacity = m.color[3]/255;
                }
            }
            let m3 = new THREE.Mesh(geo,mtl);
            m3.name = m.name ?? "";
            m3.userData = new UserData(true);
            this.scene.add(m3);
        });
        
        this.draw();
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

        // this.perspectiveControls.up.set(ux,uy,uz);
        // this.orthoControls.up.set(ux,uy,uz);

        this.lookAt(dist*x, dist*y, dist*z,
            0,0,0,
            ux,uy,uz
        );

    }
}


