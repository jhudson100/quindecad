
import { Box3, Camera, Group, Vector3, WebGLRenderer } from "../ThreeTypes";

// @ts-ignore
import * as THREE from "three";

// @ts-ignore
import {LineSegmentsGeometry} from "LineSegmentsGeometry";

// @ts-ignore
import {LineSegments2} from "LineSegments2";

// @ts-ignore
import {LineMaterial} from "LineMaterial";
import { ObjectType, UserData } from "./UserData.js";
import { ObjectDepot } from "../ObjectDepot.js";
import { GeometricObject } from "../Objects/GeometricObject.js";

const sz = 0.15;
const axisSize=1;

// function screenToWorld( x: number, y: number, camera: Camera, axis: Vector3) : Vector3
// {

// }


export class TransformWidget{
    private scene: any;
    private grp: Group;
    private mouseOver:number=0;
    private dragging:number=0;
    // private dragStartWorldCoordinates: Vector3;
    private dragStartScreenCoordinates: number[] = [0,0];

    private xmtl: any;
    private xmtlH: any;
    private ymtl: any;
    private ymtlH: any;
    private zmtl: any;
    private zmtlH: any;
    private xcube: any;
    private ycube: any;
    private zcube: any;

    private tracking: GeometricObject;

    constructor(){
        let mtl:any = new LineMaterial({color:0x000000, linewidth: 2});
        let grp = new THREE.Group();

        let v = [ 0,0,0,  axisSize,0,0,   0,0,0,  0,axisSize,0,   0,0,0, 0,0,axisSize ];
        let geo = new LineSegmentsGeometry();
        geo.setPositions(v);
        let m = new LineSegments2(geo,mtl);
        grp.add(m);

        let box = new THREE.BoxGeometry( sz,sz,sz );
        this.xmtl = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        this.xmtlH = new THREE.MeshBasicMaterial( { color: 0xff8080 } );
        this.xcube = new THREE.Mesh(box,this.xmtl);
        this.xcube.position.x = axisSize;
        grp.add(this.xcube);

        box = new THREE.BoxGeometry( sz,sz,sz );
        this.ymtl = new THREE.MeshBasicMaterial( { color: 0x00a000});
        this.ymtlH = new THREE.MeshBasicMaterial( { color: 0x80ff80 } );
        this.ycube = new THREE.Mesh(box,this.ymtl);
        this.ycube.position.y = axisSize;
        grp.add(this.ycube);

        box = new THREE.BoxGeometry( sz,sz,sz );
        this.zmtl = new THREE.MeshBasicMaterial( { color: 0x0000ff});
        this.zmtlH = new THREE.MeshBasicMaterial( { color: 0xa0a0ff } );
        this.zcube = new THREE.Mesh(box,this.zmtl);
        this.zcube.position.z = axisSize;
        grp.add(this.zcube);

        grp.userData = new UserData( {type: ObjectType.TRANSFORM_WIDGET } );
        this.grp=grp;

        this.scene = new THREE.Scene();
        this.scene.add(grp);
    }

    trackObject( obj: GeometricObject ) {
        this.tracking=obj;
        // this.grp.matrix = 
    }


 
    draw(renderer: WebGLRenderer, camera: Camera){
        renderer.render(this.scene, camera );
    }

    //returns tuple: [mouse is over, this is a change]
    mouseMove( x: number, y: number, camera:Camera){

        
        let screen = new THREE.Vector3(x,y,0);

        let mouseIsOver=false;
        let thisIsAChange=false;

        if( this.dragging !== 0 ){
            console.log("DRAG");
            //we are currently dragging one of the handles
            let axis: Vector3;
            switch(this.dragging){
                case 1: axis = new THREE.Vector3(1,0,0); break;
                case 2: axis = new THREE.Vector3(0,1,0); break;
                case 3: axis = new THREE.Vector3(0,0,1); break;
            }

            //FIXME: Should we do applyMatrix4(this.grp.matrixWorld) here?
            let originScreen = new THREE.Vector3(0,0,0).project(camera);
            originScreen.z=0;

            let axisScreen = axis.clone().project(camera);
            axisScreen.z=0;

            let dx = x-this.dragStartScreenCoordinates[0];
            let dy = y-this.dragStartScreenCoordinates[1];
            let distance = Math.sqrt(dx*dx + dy*dy);

            //vector from mouse down location to current mouse position
            let sv = new THREE.Vector3(x,y,0).sub(
                new THREE.Vector3(
                    this.dragStartScreenCoordinates[0],
                    this.dragStartScreenCoordinates[1],
                    0
                )
            );

            //dot product so we can tell direction
            let dp = sv.dot(axisScreen);

            //FIXME: Set this according to camera zoom 
            let scaleFactor = 0.01;

            if(dp<0)
                scaleFactor = -scaleFactor;

            axis = axis.multiplyScalar(scaleFactor);


            // let world = screenToWorld(x,y,camera,axis);
            // let delta = world.sub(this.dragStartWorldCoordinates);
            // if( this.dragging === 1 )
            //     delta.y = delta.z = 0;
            // else if( this.dragging === 2 )
            //     delta.x = delta.z = 0;
            // else if( this.dragging === 3 )
            //     delta.x = delta.y = 0;

            ObjectDepot.translateSelection( axis.x, axis.y, axis.z );

            this.dragStartScreenCoordinates = [x,y];
            //we always return false when we are dragging the mouse
            return [mouseIsOver,thisIsAChange];
        }

    

        if( this.mouseOverHelper( screen, camera, axisSize,0,0 ) ){
            mouseIsOver=true;
            if( this.mouseOver !== 1 ){
                this.xcube.material = this.xmtlH;
                this.ycube.material = this.ymtl;
                this.zcube.material = this.zmtl;
                this.mouseOver = 1;
                thisIsAChange=true;
            }
        } else if( this.mouseOverHelper( screen, camera, 0,axisSize,0 ) ){
            mouseIsOver=true;
            if( this.mouseOver !== 2 ){
                this.xcube.material = this.xmtl;
                this.ycube.material = this.ymtlH;
                this.zcube.material = this.zmtl;
                this.mouseOver = 2;
                thisIsAChange=true;
            }
        } else if( this.mouseOverHelper( screen, camera, 0,0,axisSize ) ){
            mouseIsOver=true;
            if( this.mouseOver !== 3 ){
                this.xcube.material = this.xmtl;
                this.ycube.material = this.ymtl;
                this.zcube.material = this.zmtlH;
                this.mouseOver = 3;
                thisIsAChange=true;
            }
        } else {
            if( this.mouseOver !== 0 ){
                this.mouseOver = 0;
                this.xcube.material = this.xmtl;
                this.ycube.material = this.ymtl;
                this.zcube.material = this.zmtl;
                thisIsAChange=true;
            }
        }

        return [mouseIsOver,thisIsAChange];

    }
    
    private mouseOverHelper(screen: Vector3, camera: Camera, xsize:number, ysize:number, zsize:number ){

        //ref: https://stackoverflow.com/questions/45860183/threejs-2d-bounding-box-of-3d-object
        let center = new THREE.Vector3(xsize,ysize,zsize);

        //get a point that's away from center in direction perpendicular to view
        let center2 = center.clone().add( camera.up.clone().multiplyScalar(sz) );

        center.applyMatrix4(this.grp.matrixWorld);       //treats w coord as 1
        center2.applyMatrix4(this.grp.matrixWorld);       //treats w coord as 1
        center.project(camera);
        center2.project(camera);
        
        let z = center.z;
        center.z=0;
        center2.z=0;
        
        let radius = center2.clone().sub(center).length();
        let dist = center.clone().sub(screen).length();

        return dist <= radius;
    }

    beginDrag(x:number,y:number,camera:Camera){
        if( this.mouseOver === 0 ){
            console.log("Cannot drag when mouse is not over");
            return;
        }
        console.log("BEGINDRAG");
        this.dragging=this.mouseOver;
        // this.dragStartWorldCoordinates = screenToWorld(x,y,camera);
        this.dragStartScreenCoordinates = [x,y];
    }

    endDrag(){
        console.log("ENDDRAG");
        this.dragging=0;
        //FIXME: Do we need to call translateSelection one last time?
    }

        // if( dist <= radius ){
        //     if( this.mouseOver !== 1 ){
        //         this.xcube.material = this.xmtlH;
        //         this.ycube.material = this.ymtl;
        //         this.zcube.material = this.zmtl;
        //         this.mouseOver = 1;
        //         return [true,true];
        //     } else {
        //         return [true,false];
        //     }
        // }

        // let I = View.get().getObjectUnderMouse(x,y,camera, this.scene, false);
        // if(I && I.object.userData ){
        //     let u = I.object.userData;
        //     return true;
        // } else {
        //     return false;
        // }


}