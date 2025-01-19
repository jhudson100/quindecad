import {ErrorReporter} from "ErrorReporter";
import {View} from "View";
import {Editor} from "Editor";
import {ButtonBar} from "ButtonBar";
import {PythonManager} from "PythonManager";
import { WorkerManager } from "WorkerManager";
// @ts-ignore
import Split from 'Split';


// @ts-ignore
var ace: any = window.ace

enum SplitDirection{
    HORIZONTAL, VERTICAL
};

export function setupInterface(){
    // console.log("In setup");


    /* 

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

    //Split.js can't work with em's here; px work though
    let contentArea = createGrid(  document.body, 
            "auto 1fr 10px 0.25fr",               //rows
            "1fr 10px 1fr"                          //cols
    );
    contentArea.style.width = "99vw";
    contentArea.style.height = "99vh";

    let currentRow = 1;

    let bbardiv =createGridCell( contentArea, currentRow,1, 1,3 );
    bbardiv.style.width="calc(100%)";
    let bbar = ButtonBar.get().initialize(bbardiv);

    currentRow=2;

    // let helpdiv = createGridCell( contentArea, currentRow,1, 1,3 );
    // helpdiv.style.background="red";
    // helpdiv.innerHTML="FOO";

    // currentRow=4;

    let viewdiv = createGridCell( contentArea, currentRow,1, 1,1 );
    viewdiv.style.width="calc(100%)";
    viewdiv.style.height="calc(100%)";
    viewdiv.style.background="#cccccc";

    View.initialize(viewdiv);

    let eddiv = createGridCell( contentArea, currentRow,3, 1,1);
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

    currentRow = 4;

    let errdiv = createGridCell( contentArea, currentRow,1, 1,3);
    errdiv.style.height="100%";
    ErrorReporter.get().initialize(errdiv);


    let sizeCallback = () => {
        View.get().resize();
        Editor.get().resize();
        ErrorReporter.get().resize();     
    };

    createHorizontalSizers( contentArea, [3],  1, 3, sizeCallback );
    createVerticalSizers(contentArea, [2], 2, 1, sizeCallback );


    // let sizer2 = createSizer(contentArea,currentRow,1, 1,3, SplitDirection.HORIZONTAL,
    //     () => {
    //         View.get().resize();
    //         Editor.get().resize();
    //         ErrorReporter.get().resize();
    //     }
    // );

   
    window.addEventListener("resize", () => {
        View.get().resize();
        Editor.get().resize();
        ErrorReporter.get().resize();
    });

}

function styleSizer(g: HTMLDivElement, splitDirection: SplitDirection){
    g.style.background="#aaaaaa";
    g.style.borderStyle="outset";
    g.style.borderColor="lightgrey";
    g.style.cursor = (splitDirection == SplitDirection.VERTICAL) ? "col-resize" : "row-resize";
}

function createHorizontalSizers(parent: HTMLElement, 
    rows: number[], firstColumn: number, colspan: number,
        dragEndCallback?: () => void )
{
    let gutters: any[] = [];

    for(let i=0;i<rows.length;++i){
        let row = rows[i];
        let g = createGridCell(parent,row,firstColumn,1,colspan);
        styleSizer(g,SplitDirection.HORIZONTAL);
        gutters.push({ track: row-1, element: g } );
    }

    Split( {
        // minSize: 10,
        rowGutters: gutters,
        onDragEnd: (direction: string, track: number) => { 
            if(dragEndCallback){
                dragEndCallback();
            }
        }
    });
}


function createVerticalSizers(parent: HTMLElement, 
    columns: number[], firstRow: number, rowSpan: number,
        dragEndCallback?: () => void )
{
    let gutters: any[] = [];

    for(let i=0;i<columns.length;++i){
        let col = columns[i];
        let g = createGridCell(parent,firstRow,col,rowSpan,1);
        styleSizer(g,SplitDirection.VERTICAL);
        gutters.push({ track: col-1, element: g } );
    }

    Split( {
        // minSize: 10,
        columnGutters: gutters,
        onDragEnd: (direction: string, track: number) => { 
            if(dragEndCallback){
                dragEndCallback();
            }
        }
    });
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
