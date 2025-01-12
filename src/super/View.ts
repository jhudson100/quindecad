//FIXME: Allow orthographic/perspective view toggle
//FIXME: Allow user to click edge and then show statistics (length, endpoints) of that edge
//FIXME: Add wireframe display option: solid, solid+wireframe, wireframe only

import {Mesh} from "Mesh";

// @ts-ignore
import * as THREE from "three";

// @ts-ignore
import {OrbitControls} from "../../ext/three/OrbitControls.js";

// import {OrbitControls} from "../../ext/three/package/examples/jsm/controls/OrbitControls.js";


export class View{

    private static instance: View;

    parent: HTMLElement;
    meshes: Mesh[] = [];
    camera: any;
    scene: any;
    light: any;
    renderer: any;
    controls: any;
    persistent: any;

    grid: any[] = [];
    gridVisible=true;

    private constructor(parent: HTMLElement){
        this.parent=parent;

        this.renderer = new THREE.WebGLRenderer();
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
        this.light = new THREE.PointLight(
            0xffffff,   //color
            4,          //intensity
            0,          //max distance
            0           //decay
        );
        this.light.name="point light";

        //things that should stay in the scene permanently
        this.persistent = new THREE.Group();
        this.persistent.name="keep_persistent";  //flag it so setMeshes() will leave it alone
        this.scene.add(this.persistent);

        this.persistent.add(amb);
        this.persistent.add(this.light);

        //ground grid
        let gridmtls = [ 
            new THREE.LineBasicMaterial({color:0xa0a0a0, linewidth: 0.5}) ,
            new THREE.LineBasicMaterial({color:0xddddff, linewidth: 0.5})
        ];
        let gridLines: any[][] =[ [],[] ];
        for(let i=-100;i<=100;i++){
            let idx = (i%10) ? 1:0;
            gridLines[idx].push( new THREE.Vector3(   i,-100, 0) );
            gridLines[idx].push( new THREE.Vector3(   i, 100, 0) );
            gridLines[idx].push( new THREE.Vector3(-100,   i, 0) );
            gridLines[idx].push( new THREE.Vector3( 100,   i, 0));
        }
        for(let i=0;i<2;++i){
            let geo = new THREE.BufferGeometry();
            geo.setFromPoints(gridLines[i]);
            let m = new THREE.LineSegments(geo,gridmtls[i]);
            this.grid.push(m);
            m.name="gridLine"+i;
            this.persistent.add(m);
        }

        //axes
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
            this.persistent.add(axis);
        }

        this.controls = new OrbitControls(this.camera,this.renderer.domElement);
        this.controls.enableDamping=false;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.DOLLY
        };

        parent.appendChild(this.renderer.domElement);


        //for testing
        let geom = new THREE.BoxGeometry(1,1,1);
        let mtl = new THREE.MeshLambertMaterial({color: 0x00ff00 } );
        let cube = new THREE.Mesh(geom,mtl);
        cube.name="test cube";
        this.scene.add(cube);

        this.resize();
        this.draw();

        let periodicFunc = () => {
            this.controls.update();
            this.draw();
            setTimeout( periodicFunc, 60 );
        };
        periodicFunc();

        document.addEventListener("keydown", (ev: KeyboardEvent) => {
            if( document.activeElement === document.body ){
                switch(ev.key){
                    case "g":
                        this.toggleGrid();
                        return;
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
        this.gridVisible = !this.gridVisible;
        if( this.gridVisible ){
            this.grid.forEach( (elem: any) => {
                this.persistent.add(elem);
            });
        } else {
            this.grid.forEach( (elem: any) => {
                elem.removeFromParent();
            });
        }
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
            let name: string = c.name;
            if( name && name.startsWith("keep_") ){
            } else {
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
            m3.name="manifoldmesh";
            this.scene.add(m3);
        });
        
        this.draw();
    }

}


