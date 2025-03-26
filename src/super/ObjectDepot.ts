/** The ObjectDepot keeps track of all the geometric objects we have
 * in the file.
 */

import { GeometricObject } from "./Objects/GeometricObject.js";

//all the objects we know about
let allObjects: GeometricObject[] = [];

//names of all the objects we have in allObjects
//so we can quickly search them
let allObjectNames = new Set<string>();

//callbacks to be executed whenever we add an object to the depot
type AddObjectListener = (obj: GeometricObject) => void;
let addObjectCallbacks: AddObjectListener[] = [];


export function getUniqueNameForObject( stem: string){
    if( !allObjectNames.has(stem) )
        return stem;
    for(let i=0; ; i++){
        let n = stem+"."+i;
        if( !allObjectNames.has(n))
            return n;
    }
}

//Function that is called when an object is added to the depot
export function addAddObjectListener( func: AddObjectListener){
    addObjectCallbacks.push(func);
}

export function addObjectToDepot( obj: GeometricObject ){
    allObjects.push(obj);
    allObjectNames.add(obj.name);
    addObjectCallbacks.forEach( (f: AddObjectListener ) => {
        f(obj);
    });
}