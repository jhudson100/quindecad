
import { Box3, Camera, Group, Vector2, Vector3, WebGLRenderer } from "../ThreeTypes";

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
 
enum DragAxis{
    NONE,X,Y,Z
};

export class TransformWidget{

    //the scene; used for overlay rendering
    private scene: any;

    //holds all the geometry we're drawing
    private grp: Group;

    //which widget the mouse is over; 0=none; 1=x, 2=y, 3=z
    private mouseOver:DragAxis=DragAxis.NONE;

    //which widget we're dragging: 0=none
    private dragging:DragAxis=DragAxis.NONE;

    //screen space coordinates where dragging started
    // private dragStartScreenCoordinates: number[] = [0,0];

    private positiveDirectionInScreenSpace: Vector3;
    private previousScreenSpaceCoords: Vector3;

    // private previousWorldSpaceCoords: Point3;

    //materials for the 3 handles: Normal and Hover materials
    private xmtl: any;
    private xmtlH: any;
    private ymtl: any;
    private ymtlH: any;
    private zmtl: any;
    private zmtlH: any;

    //handle endpoints
    private xcube: any;
    private ycube: any;
    private zcube: any;

    //the object that we are tracking
    // private tracking: GeometricObject;

    constructor(origin: Vector3, camera: Camera){
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
        this.grp.position.set( origin.x, origin.y, origin.z );

        // let sa = this.oneUnitInScreenSpaceIsThisDistanceInWorldSpace(camera);
        // this.grp.scale.set(sa,sa,sa);

        this.scene = new THREE.Scene();
        this.scene.add(grp);
    }
 
    draw(renderer: WebGLRenderer, camera: Camera){
        let sa = this.oneUnitInScreenSpaceIsThisDistanceInWorldSpace(camera);
        sa *= 0.375;
        this.grp.scale.set(sa,sa,sa);
        renderer.render(this.scene, camera );
    }

    //returns tuple: [mouse is over, this is a change]
    mouseMove( x: number, y: number, camera:Camera){

        
        let screenSpaceCoord = new THREE.Vector2(x,y);

        let mouseIsOver=false;
        let thisIsAChange=false;

        if( this.dragging !== DragAxis.NONE ){
            //we are currently dragging one of the handles
            let axis: Vector3;
            switch(this.dragging){
                case DragAxis.X: axis = new THREE.Vector3(1,0,0); break;
                case DragAxis.Y: axis = new THREE.Vector3(0,1,0); break;
                case DragAxis.Z: axis = new THREE.Vector3(0,0,1); break;
            }

            let dx = x - this.previousScreenSpaceCoords.x;
            let dy = y - this.previousScreenSpaceCoords.y;
            let len = Math.sqrt(dx*dx + dy*dy);
            let oneunit = this.oneUnitInWorldSpaceIsThisDistanceInScreenSpace(camera);
            let wlen = len / oneunit;

            let direction:Vector3 = new THREE.Vector3(x,y,0).sub(this.previousScreenSpaceCoords);
            let dp = direction.dot(this.positiveDirectionInScreenSpace);
            if( dp < 0 )
                    wlen = -wlen;

            let delta = axis.multiplyScalar(wlen);

            this.previousScreenSpaceCoords.x = x;
            this.previousScreenSpaceCoords.y = y;
            
            this.grp.position.add( delta );
            ObjectDepot.translateSelection( delta.x, delta.y, delta.z );
            return [mouseIsOver,thisIsAChange];


/*

            //FIXME: Should we do applyMatrix4(this.grp.matrixWorld) here?
            let originScreen = new THREE.Vector3(0,0,0).project(camera);
            originScreen.z=0;

            let axisScreen = axis.clone().project(camera);
            axisScreen.z=0;

            let dx = x-this.dragStartScreenCoordinates[0];
            let dy = y-this.dragStartScreenCoordinates[1];
            // let distance = Math.sqrt(dx*dx + dy*dy);

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
            return [mouseIsOver,thisIsAChange];
*/
        }

    
        if( this.mouseOverHelper( screenSpaceCoord, camera, DragAxis.X ) ){
            mouseIsOver=true;
            console.log("OX");
            if( this.mouseOver !== 1 ){
                this.xcube.material = this.xmtlH;
                this.ycube.material = this.ymtl;
                this.zcube.material = this.zmtl;
                this.mouseOver = 1;
                thisIsAChange=true;
            }
        } else if( this.mouseOverHelper( screenSpaceCoord, camera, DragAxis.Y ) ){
            mouseIsOver=true;
            if( this.mouseOver !== 2 ){
                this.xcube.material = this.xmtl;
                this.ycube.material = this.ymtlH;
                this.zcube.material = this.zmtl;
                this.mouseOver = 2;
                thisIsAChange=true;
            }
        } else if( this.mouseOverHelper( screenSpaceCoord, camera, DragAxis.Z ) ){
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
    
    /** Helper function to tell if the mouse is over one of the transform handles
     * @param screenSpaceCoords Screen space coordinate of mouse
     * 
     */
    private mouseOverHelper(screenSpaceCoords: Vector2, camera: Camera, axis: DragAxis )
    {

        //ref: https://stackoverflow.com/questions/45860183/threejs-2d-bounding-box-of-3d-object

        //world space location of center of the transform handle
        let center: Vector3;
        switch(axis){
            case DragAxis.X: center = new THREE.Vector3(axisSize,0,0); break;
            case DragAxis.Y: center = new THREE.Vector3(0,axisSize,0); break;
            case DragAxis.Z: center = new THREE.Vector3(0,0,axisSize); break;
        }

        //get a point that's away from center in direction perpendicular to view
        //we will use this to see if the mouse is close to the manipulation handle
        //without having to do a raycast with the faces of the handle.

        let center2 = center.clone().add( camera.up.clone().multiplyScalar(sz) );

        center.applyMatrix4(this.grp.matrixWorld);       //treats w coord as 1
        center2.applyMatrix4(this.grp.matrixWorld);       //treats w coord as 1
        center.project(camera);
        center2.project(camera);
        
        let z = center.z;
        center.z=0;
        center2.z=0;
        
        let radius = center2.clone().sub(center).length();
        let tmp = new THREE.Vector3(screenSpaceCoords.x, screenSpaceCoords.y, 0);
        let dist = center.clone().sub(tmp).length();

        return dist <= radius;
    }

    beginDrag(x:number,y:number,camera:Camera){
        if( this.mouseOver === DragAxis.NONE ){
            console.log("Cannot drag when mouse is not over");
            return;
        }
        console.log("BEGINDRAG");
        this.dragging=this.mouseOver;
        this.previousScreenSpaceCoords = new THREE.Vector3(x,y,0);

        let tmp: Vector3;
        switch(this.mouseOver){
            case DragAxis.X: tmp = new THREE.Vector3(1,0,0); break;
            case DragAxis.Y: tmp = new THREE.Vector3(0,1,0); break;
            case DragAxis.Z: tmp = new THREE.Vector3(0,0,1); break;
        }

        //handle point: Center of  the active handle
        let hpoint: Vector3 = new THREE.Vector3( tmp.x*axisSize, tmp.y*axisSize, tmp.z*axisSize );
        hpoint.applyMatrix4( this.grp.matrix );

        //one world space unit away from handle point
        let hpoint2 = hpoint.clone().add(tmp);

        hpoint.project(camera);
        hpoint2.project(camera);

        this.positiveDirectionInScreenSpace = hpoint2.clone().sub(hpoint);
        
        // this.previousWorldSpaceCoords = screenToWorld(x,y,camera);
        // this.dragStartScreenCoordinates = [x,y];
    }

    endDrag(){
        console.log("ENDDRAG");
        this.dragging=0;
        //FIXME: Do we need to call translateSelection one last time?
    }

    //assumes that we are currently dragging a handle; gives
    //the screen space distance that corresponds to moving one
    //unit down the axis for the active handle, starting at the
    //position of the active handle
    oneUnitInWorldSpaceIsThisDistanceInScreenSpace(camera: Camera) : number{
        let tmp: Vector3;
        switch(this.mouseOver){
            case DragAxis.X: tmp = new THREE.Vector3(1,0,0); break;
            case DragAxis.Y: tmp = new THREE.Vector3(0,1,0); break;
            case DragAxis.Z: tmp = new THREE.Vector3(0,0,1); break;
            default: throw new Error("not dragging");
        }
        //handle point: Center of the active handle
        let hpoint: Vector3 = new THREE.Vector3( tmp.x*axisSize, tmp.y*axisSize, tmp.z*axisSize );
        hpoint.applyMatrix4( this.grp.matrix );

        //one world space unit away from handle point
        let hpoint2 = hpoint.clone().add(tmp);

        hpoint.project(camera);
        hpoint2.project(camera);

        let dx = hpoint.x-hpoint2.x;
        let dy = hpoint.y-hpoint2.y;
        return Math.sqrt(dx*dx+dy*dy);
    }

    //uses the center of the transform object for the measurement
    oneUnitInScreenSpaceIsThisDistanceInWorldSpace(camera:Camera): number{
        let tmp:Vector3 = this.grp.position.clone().project(camera);
        tmp.x += 1;
        tmp.unproject(camera);      //tmp is now in world space again

        let tmp2:Vector3 = this.grp.position.clone().sub(tmp);
        return tmp2.length();
    }
}