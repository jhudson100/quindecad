import { GeometricObject } from "../Objects/GeometricObject";


//THREE allows us to attach user data to each object in the scene
//This user data can contain anything we want to associate with the object.
export class UserData {
    associatedObject: GeometricObject;
    constructor(obj: GeometricObject) {
        this.associatedObject = obj;
    }
}
