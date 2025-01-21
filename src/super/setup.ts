import {ErrorReporter} from "ErrorReporter";
import {View} from "View";
import {Editor} from "Editor";
import {ButtonBar} from "ButtonBar";
import {PythonManager} from "PythonManager";
import { WorkerManager } from "WorkerManager";
// @ts-ignore
import Split from 'Split';
import { ArgSpec, FuncSpec, getPreambleFunctionInfo } from "pyshimdoc";
import { getDetailedFunctionDocumentation, getFunctionSignatureDocumentation } from "utils";


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
        │           infodiv            │    row 4
        └───────────┴───┴──────────────┘

        

    */

    let sizeCallback = () => {
        View.get().resize();
        Editor.get().resize();
        ErrorReporter.get().resize();   

        let rect = helpdiv.parentElement.getBoundingClientRect();
        // helpdiv.style.width = rect.width+"px";
        helpgrid.style.height = rect.height+"px";
    };

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

    createVerticalSizer(contentArea, 2, currentRow, 1, sizeCallback );

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

    currentRow++;

    createHorizontalSizer( contentArea, currentRow,  1, 3, sizeCallback );

    currentRow++;

    let infodiv = createGridCell( contentArea, currentRow,1, 1,3);
    infodiv.style.height="100%";
    
    let grid2 = createGrid(infodiv, "1fr" , "3fr 10px 1fr");
    grid2.style.height="100%";
    let errdiv = createGridCell(grid2,1,1,1,1);
    errdiv.style.height="100%";
    ErrorReporter.get().initialize(errdiv);
    createVerticalSizer(grid2,2,1,1,sizeCallback);
    let helpgrid = createGridCell(grid2,1,3,1,1);
    helpgrid.style.overflow="auto";
    let helpdiv = createHelpDiv(helpgrid);




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

function createHorizontalSizer(parent: HTMLElement, 
    row: number, firstColumn: number, colspan: number,
        dragEndCallback?: () => void )
{
    let gutters: any[] = [];

    let g = createGridCell(parent,row,firstColumn,1,colspan);
    styleSizer(g,SplitDirection.HORIZONTAL);
    gutters.push({ track: row-1, element: g } );

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


function createVerticalSizer(parent: HTMLElement, 
    column: number, firstRow: number, rowSpan: number,
        dragEndCallback?: () => void )
{
    let gutters: any[] = [];

    let g = createGridCell(parent,firstRow,column,rowSpan,1);
    styleSizer(g,SplitDirection.VERTICAL);
    gutters.push({ track: column-1, element: g } );

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

function createHelpDiv(parent: HTMLDivElement){
    let helpdiv = document.createElement("div");
    let sel = document.createElement("select");
    helpdiv.appendChild(sel);
    parent.appendChild(helpdiv);
    let contentdiv = document.createElement("div");
    contentdiv.style.overflow="auto";
    parent.appendChild(contentdiv);

    let op = document.createElement("option");
    op.appendChild( document.createTextNode( "Get documentation...") );
    sel.appendChild(op);

    let docs: HTMLElement[] = [];
    getPreambleFunctionInfo().forEach( (fspec: FuncSpec) => {
        let op = document.createElement("option");
        sel.appendChild(op);
        op.appendChild(document.createTextNode( fspec.name ) );
        
        let d = getFunctionSignatureDocumentation(fspec,false,true) 
        d.style.fontFamily = "monospace";

        let div = document.createElement("div");
        div.appendChild(d);

        let dd = getDetailedFunctionDocumentation(fspec,false);
        div.appendChild(dd);

        docs.push( div );
    });

    let firstTime=true;
    sel.addEventListener("change", () => {
        let idx = sel.selectedIndex;
        if( firstTime ){
            if( sel.selectedIndex === 0 )
                return;
            firstTime=false;
            sel.removeChild(sel.firstChild);
            idx--;
            sel.selectedIndex = idx;
        }
        while( contentdiv.childNodes.length > 0 ){
            contentdiv.removeChild(contentdiv.firstChild);
        } 
        contentdiv.appendChild( docs[ idx ] );
    });

    return helpdiv;
}