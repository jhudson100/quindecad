//FIXME: Allow orthographic/perspective view toggle
//FIXME: Allow user to click edge and then show statistics (length, endpoints) of that edge
//FIXME: Add wireframe display option: solid, solid+wireframe, wireframe only

import {Mesh} from "Mesh";

// @ts-ignore
import * as THREE from "three";

// @ts-ignore
import {OrbitControls} from "OrbitControls";
import { ErrorReporter } from "ErrorReporter";

//user data for meshes and other objects
class UserData {
    isMesh: boolean;        //true if it's a Manifold mesh
    constructor(isMesh: boolean){
        this.isMesh=isMesh;
    }
}

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

    //camera for the scene
    camera: any;

    //light that is located at the eye
    light: any;

    //the renderer: Draws the scene
    renderer: any;

    //control object that handles mouse interaction
    controls: any;     

    //the coordinate axes
    axes: any;

    //the ground grid (grid along the xy plane)
    grid: any;

    //raycaster for object picking
    raycaster: any;

    //last mouse position in normalized device coordinates for picking
    lastMouseX: number = 0;
    lastMouseY: number = 0;

    private constructor(parent: HTMLElement){
        this.parent=parent;

        this.renderer = new THREE.WebGLRenderer({antialias:true} );
        this.renderer.setSize(16,16);   //dummy

        this.camera = new THREE.PerspectiveCamera( 
            75, //fov
            1.0,    //aspect ratio
            0.1,        //hither
            1000        //yon
        );
        this.camera.position.x=5;
        this.camera.position.y=-5;
        this.camera.position.z=5;
        this.camera.lookAt(0,0,0);
        this.camera.up = new THREE.Vector3(0,0,1);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        let amb = new THREE.AmbientLight(0x404040);
        amb.name="ambient light";
        amb.userData = new UserData(false);
        this.light = new THREE.PointLight(
            0xffffff,   //color
            4,          //intensity
            0,          //max distance
            0           //decay
        );
        this.light.userData = new UserData(false);
        this.light.name="point light";

        this.scene.add(amb);
        this.scene.add(this.light);

        //ground grid
        //TODO: Make these colors configurable
        let gridmtls = [ 
            new THREE.LineBasicMaterial({color:0xa0a0a0, linewidth: 0.5}) ,
            new THREE.LineBasicMaterial({color:0xddddff, linewidth: 0.5})
        ];
        //TODO: Make these extents configurable
        const gridExtent=200;
        let gridLines: any[][] =[ [],[] ];
        for(let i=-gridExtent;i<=gridExtent;i++){
            let idx = (i%10) ? 1:0;
            gridLines[idx].push( new THREE.Vector3(   i,-gridExtent, 0) );
            gridLines[idx].push( new THREE.Vector3(   i, gridExtent, 0) );
            gridLines[idx].push( new THREE.Vector3(-gridExtent,   i, 0) );
            gridLines[idx].push( new THREE.Vector3( gridExtent,   i, 0));
        }
        this.grid = new THREE.Group();
        this.grid.name="grid";  
        for(let i=0;i<2;++i){
            let geo = new THREE.BufferGeometry();
            geo.setFromPoints(gridLines[i]);
            let m = new THREE.LineSegments(geo,gridmtls[i]);
            m.name="gridLine"+i;
            this.grid.add(m);
        }
        this.grid.userData = new UserData(false);
        this.scene.add(this.grid);

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
        this.controls = new OrbitControls(this.camera,this.renderer.domElement);
        this.controls.enableDamping=false;
        this.controls.mouseButtons = {
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
        let nextDrawTime = 0;
        let periodicFunc =  (timestamp: DOMHighResTimeStamp) => {
            requestAnimationFrame(periodicFunc);
            if( timestamp >= nextDrawTime ){
                nextDrawTime = timestamp + 30;
                this.controls.update();
                this.draw();
            }
        };
        periodicFunc(0);


        this.raycaster = new THREE.Raycaster();

        document.addEventListener("keydown", (ev: KeyboardEvent) => {
            if( document.activeElement === document.body ){
                switch(ev.key){
                    case "g":
                        this.toggleGrid();
                        return;
                    case "a":
                        this.toggleAxes();
                        return;
                    case "p":
                    {
                        let p = new THREE.Vector2(this.lastMouseX,this.lastMouseY);
                        this.raycaster.setFromCamera( p, this.camera );
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

    toggleGrid(){
        this.grid.visible = !this.grid.visible;
        this.draw();
    }

    toggleAxes(){
        this.axes.visible = !this.axes.visible;
        this.draw();
    }

    draw(){
        this.controls.update();
        let p = this.camera.position;
        this.light.position.set(p.x,p.y,p.z);
        this.renderer.render(this.scene, this.camera);
    }

    resize(){
        let rect = this.parent.getBoundingClientRect();
        this.renderer.setSize( rect.width, rect.height);
        this.camera.aspect = rect.width/rect.height;
        this.camera.updateProjectionMatrix();
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

}


