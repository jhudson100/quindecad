import { Color } from "../common/Mesh";
import { Manifold } from "../ext/manifold/manifold-encapsulated-types";

export class ManifoldMeshWrapper{
    mesh: Manifold;
    color: Color;
    freed:boolean;
    constructor(mesh: Manifold, color: Color)
    {
        this.mesh=mesh;
        this.color=color;
        this.freed=false;
    }
}

export class MeshHandle{
    index: number;
    _is_drawable_: boolean
    constructor(mw: ManifoldMeshWrapper){
        this.index=manifoldMeshes.length;
        this._is_drawable_ = true;
        manifoldMeshes.push(mw);
    }
}

//all the meshes we create during a python execution
export let manifoldMeshes: ManifoldMeshWrapper[] = [];

//indices of the meshes in manifoldMeshes which we want to draw
export let toDraw: MeshHandle[] = [];
