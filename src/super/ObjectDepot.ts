/** The ObjectDepot keeps track of all the geometric objects we have
 * in the file.
 */

import { GeometricObject } from "./Objects/GeometricObject.js";
import { SelectionManager } from "./SelectionManager.js";

//all the objects we know about
let allObjects: GeometricObject[] = [];

//names of all the objects we have in allObjects
//so we can quickly search them
let allObjectNames = new Set<string>();

//callbacks to be executed whenever we add an object to the depot
type ObjectCreatedListener = (obj: GeometricObject) => void;
let objectCreatedCallbacks: ObjectCreatedListener[] = [];

//callbacks to be executed whenever we change object transforms
type ObjectTransformedListener = (obj: GeometricObject[]) => void;
let objectTransformedCallbacks: ObjectTransformedListener[] = [];

export class ObjectDepot{

  
    static getUniqueNameForObject( stem: string){
        if( !allObjectNames.has(stem) )
            return stem;
        for(let i=0; ; i++){
            let n = stem+"."+i;
            if( !allObjectNames.has(n))
                return n;
        }
    }

    static addObjectCreatedListener( func: ObjectCreatedListener){
        objectCreatedCallbacks.push(func);
    }


    static addObjectToDepot( obj: GeometricObject ){
        allObjects.push(obj);
        allObjectNames.add(obj.name);
        objectCreatedCallbacks.forEach( (f: ObjectCreatedListener ) => {
            f(obj);
        });
    }

    //This adds tx,ty,tz to the existing objects' translation
    //and calls the listeners
    static translateSelection( tx: number, ty: number, tz: number){
        let changed: GeometricObject[] = [];

        SelectionManager.applyToSelection( (obj: GeometricObject) => {
            obj.transform.translation[0] += tx;
            obj.transform.translation[1] += ty;
            obj.transform.translation[2] += tz;
            changed.push(obj);
        });

        objectTransformedCallbacks.forEach( (f: ObjectTransformedListener) => {
            f(changed);
        });
    }

    static addObjectTransformedListener(f: ObjectTransformedListener ){
        objectTransformedCallbacks.push(f);
    }
    
    static removeObjectFromDepot( obj: GeometricObject ) {
        //Remove it from selection if it's there
        //call removeObjectCallback's
        //FIXME: TODO
        throw new Error();
    }

    /** Transform an object and call the callbacks */
    static setObjectTransformation( obj: GeometricObject, translation: number[])
    {
        obj.transform.translation = [translation[0], translation[1], translation[2]];
        let L=[obj];
        objectTransformedCallbacks.forEach( (f: ObjectTransformedListener) => {
            f(L);
        });
    }



}