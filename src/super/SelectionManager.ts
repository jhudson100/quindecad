//This class manages the current selection and callbacks when the selection changes.

import { GeometricObject } from "./Objects/GeometricObject.js";



//callbacks to execute whenever selection changes
export interface SelectionEvent {
    obj: GeometricObject;   //affected object
    nowSelected: boolean;   //true if the object is now selected; false if not
}
type SelectionChangeListener = (changed: SelectionEvent[]) => void;
let selectionChangedCallbacks: SelectionChangeListener[] = [];
type ApplyFunc = (obj: GeometricObject) => void;


let selectedObjects: GeometricObject[] = [];

export class SelectionManager{

    //callback gets a list of changed selections; things that didn't have
    //their selection status change are NOT in the list
    static addSelectionChangeListener( func: SelectionChangeListener){
        selectionChangedCallbacks.push(func);
    }

    static applyToSelection( func: ApplyFunc ){
        selectedObjects.forEach( (obj: GeometricObject) => { func(obj); } );
    }


    /** Clear current selection */
    static clearSelection(){
        if( selectedObjects.length > 0 ){
            let ev: SelectionEvent[] = [];
            selectedObjects.forEach( (o: GeometricObject) => {
                o.selected=false;
                ev.push( {obj: o, nowSelected:false} );
            });
            selectedObjects = [];
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

        selectedObjects.forEach( (o: GeometricObject) => {
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

        selectedObjects = selected;
        selectionChangedCallbacks.forEach( (f: SelectionChangeListener ) => { f(ev); } );
    }

    /** Toggle selection of one object; leave any other selected objects alone. */
    static toggleSelection(obj: GeometricObject){
        let ev: SelectionEvent[] = [];

        let i = selectedObjects.findIndex( (x) => { return x === obj } );
        if( i === -1 ){
            selectedObjects.push(obj);
            obj.selected=true;
            ev.push( {obj: obj, nowSelected:true} );
        } else {
            selectedObjects.splice(i,1);
            obj.selected=false;
            ev.push( {obj: obj, nowSelected:false} );
        }
        selectionChangedCallbacks.forEach( (f: SelectionChangeListener ) => { f(ev); } );
    }

}