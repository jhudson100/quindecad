// @ts-ignore
import * as THREE from "three";
import { Vector3, Camera } from "../ThreeTypes";
import { Point3 } from "../Point3";

export class Label {
    worldPoint: Point3;
    cvs: HTMLCanvasElement;
    elem: HTMLElement;
    elemW: number;
    constructor(parent: HTMLElement, p: Point3, txt: string) {
        this.worldPoint = p;
        this.elem = document.createElement("span");
        parent.appendChild(this.elem);
        this.elem.appendChild(document.createTextNode(txt));
        this.elem.style.position = "absolute";
        this.elem.classList.add("label3d");

        //need to do this after applying css styles above
        let r = this.elem.getBoundingClientRect();
        this.elemW = r.width;

        this.cvs = document.createElement("canvas");
        this.cvs.style.position = "absolute";
        this.cvs.width = 8;
        this.cvs.height = 8;
        let ctx = this.cvs.getContext("2d");
        ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
        ctx.fillStyle = "#8080ff";
        ctx.strokeStyle = "black";
        ctx.arc(this.cvs.width / 2, this.cvs.height / 2, this.cvs.width / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        parent.appendChild(this.cvs);

    }
    removeDOMElements() {
        this.cvs.parentNode.removeChild(this.cvs);
        this.elem.parentNode.removeChild(this.elem);
    }

    updatePosition(camera: Camera, w: number, h: number) {
        let p = new THREE.Vector4(this.worldPoint.x, this.worldPoint.y, this.worldPoint.z, 1);

        p.applyMatrix4(camera.matrixWorldInverse);
        p.applyMatrix4(camera.projectionMatrix);
        let x = p.x / p.w;
        let y = p.y / p.w;
        y = -y;
        x = (x + 1) / 2;
        y = (y + 1) / 2;
        x = x * w;
        y = y * h;

        let tmp = x - this.elemW / 2;
        this.elem.style.left = tmp + "px";
        this.elem.style.top = (y + 4) + "px";

        let cx = (x - this.cvs.width / 2);
        let cy = (y - this.cvs.height / 2);
        this.cvs.style.left = cx + "px";
        this.cvs.style.top = cy + "px";
    }
}
