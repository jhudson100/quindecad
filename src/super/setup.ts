import {ErrorReporter} from "ErrorReporter";
import {View} from "View";
import {Editor} from "Editor";
import {PythonManager} from "PythonManager";
import { WorkerManager } from "WorkerManager";
// @ts-ignore
import Split from 'Split';
import { TabSide, TabbedPanel } from "TabbedPanel";
import { HelpInfo } from "HelpInfo";
import { ClipControls } from "ClipControls";
import { setupMenubar } from "menus";
import { TreeEditor } from "TreeEditor";


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
        tabs.resize();
        ErrorReporter.get().resize();   
        helpInfo.resize();
        clipper.resize();
        edTabs.resize();
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

    currentRow=2;

    createVerticalSizer(contentArea, 2, currentRow, 1, sizeCallback );

    let viewdiv = createGridCell( contentArea, currentRow,1, 1,1 );
    viewdiv.style.width="calc(100%)";
    viewdiv.style.height="calc(100%)";
    viewdiv.style.background="#cccccc"; //this is only seen during resizing

    View.initialize(viewdiv);

    let eddiv = createGridCell( contentArea, currentRow,3, 1,1);
    eddiv.style.height="100%";

    let edTabs = new TabbedPanel(eddiv,TabSide.BOTTOM);
    let edtab = edTabs.addTab("Editor");
    Editor.get().initialize(edtab);
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

    let treetab = edTabs.addTab("Tree");
    new TreeEditor(treetab);

    currentRow++;

    createHorizontalSizer( contentArea, currentRow,  1, 3, sizeCallback );

    currentRow++;

    let infodiv = createGridCell( contentArea, currentRow,1, 1,3);
    //ref: https://blog.jim-nielsen.com/2023/width-and-height-in-css/
    //width looks up the tree and sets node to be as wide as widest parent
    //height looks down the tree and sets height to be maximum of children's heights
    infodiv.style.height="100%";


    let tabs = new TabbedPanel(infodiv,TabSide.TOP);

    ErrorReporter.get().initialize(tabs.addTab("Output"),tabs);
    let helpInfo = new HelpInfo(tabs.addTab("Help"));
    let clipper = new ClipControls(tabs.addTab("Clipping"));

   
    window.addEventListener("resize", () => {
        sizeCallback();
    });


    //must be after editor has been created
    setupMenubar(bbardiv);

    //force size computations
    sizeCallback();

}


function createHorizontalSizer(parent: HTMLElement, 
    row: number, firstColumn: number, colspan: number,
        dragEndCallback?: () => void )
{
    let gutters: any[] = [];

    let g = createGridCell(parent,row,firstColumn,1,colspan);
    g.classList.add("sizer");
    g.classList.add("horizontalSizer");
    
    // styleSizer(g,SplitDirection.HORIZONTAL);
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
    g.classList.add("sizer");
    g.classList.add("verticalSizer");
    // styleSizer(g,SplitDirection.VERTICAL);

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
