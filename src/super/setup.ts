import {ErrorReporter} from "ErrorReporter";
import {View} from "View";
import {Editor} from "Editor";
import {ButtonBar} from "ButtonBar";
import {PythonManager} from "PythonManager";
import { WorkerManager } from "WorkerManager";

// @ts-ignore
var ace: any = window.ace

enum SplitDirection{
    HORIZONTAL, VERTICAL
};

export function setupInterface(){
    // console.log("In setup");


    /*│
            contentArea

        ┌──────────────────────────────┐
        │   buttonbar (row 1, col 1)   │
        ├───────────┬───┬──────────────┤
        │           │s r│  eddiv(2,3)  │
        │           │i o│  row 2, col3 │
        │           │z w├──────────────┤
        │ viewdiv   │e s│ sizer2(3,3)  │
        │  row 2,   │r p├──────────────┤
        │  col 1    │1 a│ errdiv       │
        │ rowspan 3 │  n│ row 4, col 3 │
        │           │  3│              │
        └───────────┴───┴──────────────┘


        sz1 = sizer1

          col 1      col2   col3
        ┌───────────┬───┬──────────────┐
        │           bbardiv            │    row 1
        ├───────────┼───┼──────────────┤
        │ viewdiv   │sz1│    eddiv     │    row 2
        ├───────────┼───┼──────────────┤
        │           sizer2             │    row 3
        ├───────────┼───┼──────────────┤
        │           errdiv             │    row 4
        └───────────┴───┴──────────────┘


    */

    let contentArea = createGrid(  document.body, 
            "auto 1fr 0.1em 0.25fr", "1fr 0.1em 1fr"
    );
    contentArea.style.width = "99vw";
    contentArea.style.height = "99vh";


    let bbardiv =createGridCell( contentArea, 1,1, 1,3 );
    bbardiv.style.width="calc(100%)";
    let bbar = ButtonBar.get().initialize(bbardiv);


    let viewdiv = createGridCell( contentArea, 2,1, 1,1 );
    viewdiv.style.width="calc(100%)";
    viewdiv.style.height="calc(100%)";
    viewdiv.style.background="yellow";

    View.initialize(viewdiv);

    let sizer1 = createSizer(contentArea, 2,2, 1, 1, SplitDirection.VERTICAL);

    let eddiv = createGridCell( contentArea, 2,3, 1,1);
    eddiv.style.height="100%";
    Editor.get().initialize(eddiv);
    Editor.get().addKeyEventCommand( (ev: KeyboardEvent) => {
        if( ev.shiftKey && ev.key === "Enter" ){
            ev.preventDefault();
            ev.stopPropagation();
            if( !WorkerManager.get().isWorkerBusy()){
                //FIXME: This is async; we should wait on result
                //and do something
                PythonManager.get().runCodeFromEditor();
            }
        }
    });

    let sizer2 = createSizer(contentArea,3,1, 1,3, SplitDirection.HORIZONTAL);

    let errdiv = createGridCell( contentArea, 4,1, 1,3);
    errdiv.style.height="100%";
    ErrorReporter.get().initialize(errdiv);

    window.addEventListener("resize", () => {
        View.get().resize();
        Editor.get().resize();
        ErrorReporter.get().resize();
    });

}

function createSizer(parent: HTMLElement, row: number, column: number,
        rowspan: number, colspan: number,
        splitDirection: SplitDirection)
{
    let g = createGridCell(parent,row,column,rowspan,colspan);
    g.style.background="black"; //"fuchsia";
    return g;
}

function createGrid( parent: HTMLElement, rowSpec: string, colSpec:string)
{
    let div = document.createElement("div");
    div.style.display="grid";
    div.style.gridTemplateRows = rowSpec;
    div.style.gridTemplateColumns = colSpec;
    parent.appendChild(div);
    return div;
}
    
function createGridCell( parent:HTMLElement, row: number, column: number, rowspan?: number, colspan?: number)
{
    let div = document.createElement("div");
    div.style.gridRowStart = ""+row;
    div.style.gridRowEnd = "span "+( rowspan ?? 1 )  ;
    div.style.gridColumnStart = ""+column;
    div.style.gridColumnEnd = "span "+( colspan ?? 1 );
    div.style.overflow="hidden";
    parent.appendChild(div);
    return div;
}
