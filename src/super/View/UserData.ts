import { GeometricObject } from "../Objects/GeometricObject";


//THREE allows us to attach user data to each object in the scene
//This user data can contain anything we want to associate with the object.

export enum ObjectType {
    GEOMETRIC_OBJECT, TRANSFORM_WIDGET
}

interface ConstructorInfo{
    obj?: GeometricObject;   //if this is set, type is ignored
    type: ObjectType;
}

export class UserData {

    type: ObjectType;
    associatedObject: GeometricObject;

    constructor(info: ConstructorInfo){
        this.type = info.type;

        if( info.obj ){
            this.associatedObject = info.obj;
        }
    }
}
