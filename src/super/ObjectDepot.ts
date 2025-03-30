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

//callbacks to execute whenever selection changes
export interface SelectionEvent {
    obj: GeometricObject;
    nowSelected: boolean;
}
type SelectionChangeListener = (changed: SelectionEvent[]) => void;
let selectionChangedCallbacks: SelectionChangeListener[] = [];


export class ObjectDepot{

    static selectedObjects: GeometricObject[] = [];

    static getUniqueNameForObject( stem: string){
        if( !allObjectNames.has(stem) )
            return stem;
        for(let i=0; ; i++){
            let n = stem+"."+i;
            if( !allObjectNames.has(n))
                return n;
        }
    }

    static addAddObjectListener( func: AddObjectListener){
        addObjectCallbacks.push(func);
    }

    //callback gets a list of changed selections; things that didn't have
    //their selection status change are NOT in the list
    static addSelectionChangeListener( func: SelectionChangeListener){
        selectionChangedCallbacks.push(func);
    }

    static addObjectToDepot( obj: GeometricObject ){
        allObjects.push(obj);
        allObjectNames.add(obj.name);
        addObjectCallbacks.forEach( (f: AddObjectListener ) => {
            f(obj);
        });
    }

    static removeObjectFromDepot( obj: GeometricObject ) {
        //Remove it from selection if it's there
        //call removeObjectCallback's
        throw new Error();
    }

    /** Clear current selection */
    static clearSelection(){
        if( ObjectDepot.selectedObjects.length > 0 ){
            let ev: SelectionEvent[] = [];
            ObjectDepot.selectedObjects.forEach( (o: GeometricObject) => {
                o.selected=false;
                ev.push( {obj: o, nowSelected:false} );
            });
            ObjectDepot.selectedObjects = [];
            selectionChangedCallbacks.forEach( (f: SelectionChangeListener ) => { f(ev); } );
        }
    }

    /** Replace existing selection with a single object */
    static replaceSelection(obj: GeometricObject[]){
        let ev: SelectionEvent[] = [];

        //all things that should now be selected
        let toAdd : Set<number> = new Set();
        obj.forEach( (o: GeometricObject ) => {
            toAdd.add( o.unique );
        });

        //things that were already selected
        let alreadyHave: Set<number> = new Set();

        let selected: GeometricObject[] = [];

        ObjectDepot.selectedObjects.forEach( (o: GeometricObject) => {
            if( toAdd.has(o.unique)){
                //don't put entry in list because obj's selection
                //status isn't changing
                alreadyHave.add(o.unique);
            } else {
                //taking away selection from o
                o.selected=false;
                ev.push( {obj: o, nowSelected:false} );
            }
        });

        obj.forEach ( (o: GeometricObject) => {
            selected.push(o);
            if( !alreadyHave.has(o.unique) ){
                ev.push( {obj: o, nowSelected:true} );
                o.selected=true;
            }
            //else, it's already selected and we leave it as such
        });

        ObjectDepot.selectedObjects = selected;
        selectionChangedCallbacks.forEach( (f: SelectionChangeListener ) => { f(ev); } );
    }

    /** Toggle selection of one object; leave any other selected objects alone. */
    static toggleSelection(obj: GeometricObject){
        let ev: SelectionEvent[] = [];

        let i = ObjectDepot.selectedObjects.findIndex( (x) => { return x === obj } );
        if( i === -1 ){
            ObjectDepot.selectedObjects.push(obj);
            obj.selected=true;
            ev.push( {obj: obj, nowSelected:true} );
        } else {
            ObjectDepot.selectedObjects.splice(i,1);
            obj.selected=false;
            ev.push( {obj: obj, nowSelected:false} );
        }
        selectionChangedCallbacks.forEach( (f: SelectionChangeListener ) => { f(ev); } );
    }

}