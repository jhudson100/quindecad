import {ErrorReporter} from "ErrorReporter";
import {CameraType, GridPlane, View} from "View";
import {Editor, simpleDemoCode} from "Editor";
import {PythonManager} from "PythonManager";
import { WorkerManager } from "WorkerManager";
// @ts-ignore
import Split from 'Split';
import { makeCheckbox, saveSTL, showAboutDialog, showHelp } from "utils";
import { CheckMenuItem, Menu, Menubar } from "Menubar";
import { Spinner } from "Spinner";
import { Dialog } from "Dialog";
import { TabbedPanel } from "TabbedPanel";
import { HelpInfo } from "HelpInfo";
import { ClipControls } from "ClipControls";


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
    //ref: https://blog.jim-nielsen.com/2023/width-and-height-in-css/
    //width looks up the tree and sets node to be as wide as widest parent
    //height looks down the tree and sets height to be maximum of children's heights
    infodiv.style.height="100%";


    let tabs = new TabbedPanel(infodiv);

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

function setupMenubar(parent: HTMLElement)
{
    let shortcuts = Editor.get().getKeyboardShortcuts();

    // console.log(shortcuts);

    //FIXME: Add key listener to window for keyboard shortcuts

    function item(menu: Menu, label: string, cmd: string, winaccel?: string, macaccel?: string){
        let accel: string;
        if(winaccel){
            let platform : string = Editor.get().getPlatformForShortcuts();
            if( platform.toLowerCase().indexOf("mac") !== -1 )
                accel = macaccel;
            else
                accel = winaccel;
        }  else {
            if( shortcuts.has(cmd) ){
                accel = shortcuts.get(cmd);
                let i = accel.indexOf("|");
                if( i !== -1 ){
                    accel = accel.substring(0,i);
                }
            }
        }
        
        menu.addItem( label, () => { Editor.get().executeCommand(cmd) }, accel );
    }

    parent.style.overflow="visible";
    let mbar = new Menubar(parent);
    
    let filemenu = mbar.addMenu("File");
    let saveItem = filemenu.addItem("Save STL...", ()=>{ saveSTL(); } );
    
    let editmenu = mbar.addMenu("Edit");
    item(editmenu,"Undo","undo");
    item(editmenu,"Redo","redo");
    editmenu.addSeparator();
    //FIXME: Need correct shortcuts on Mac
    item(editmenu,"Cut","cut","Ctrl-X","Command-X");
    item(editmenu,"Copy","copy","Ctrl-C","Command-C");
    item(editmenu,"Paste","paste","Ctrl-V","Command-V");
    editmenu.addSeparator();
    item(editmenu,"Delete line","removeline");
    item(editmenu,"Clear to end", "removetolineend");
    editmenu.addSeparator();
    item( editmenu, "Select all", "selectall" );
    item( editmenu, "Duplicate selection", "duplicateSelection");
    item( editmenu, "Duplicate line", "copylinesdown");
    item( editmenu, "Move lines down", "movelinesdown");
    item( editmenu, "Move lines up", "movelinesup");
    
    let searchmenu = mbar.addMenu("Search");
    item( searchmenu, "Go to line...", "gotoline");
    item( searchmenu, "Find...", "find");
    item( searchmenu, "Replace...", "replace");
    item( searchmenu, "Find previous", "findprevious");
    item( searchmenu, "Find next", "findnext");
    item( searchmenu, "Jump to matching", "jumptomatching");
    
    let formatmenu = mbar.addMenu("Format");
    item( formatmenu, "Toggle comment", "togglecomment");
    item( formatmenu, "Indent", "blockindent");
    item( formatmenu, "Outdent", "blockoutdent");
    item( formatmenu, "Uppercase", "touppercase");
    item( formatmenu, "Lowercase", "tolowercase");
    item( formatmenu, "Sort lines", "sortlines");
    item( formatmenu, "Transpose", "transposeletters");

    let viewmenu = mbar.addMenu("View");
    viewmenu.addItem("Grid...", ()=> { conductGridDialog(); } );
    let avisible = viewmenu.addCheckItem("Show axes", View.get().areAxesVisible(), ()=> {
        let vis = View.get().toggleAxesVisible();
        avisible.setChecked(vis);
    });
    
    viewmenu.addSeparator();
    let persp: CheckMenuItem;
    let ortho: CheckMenuItem;
    let viewCallback = (t: CameraType)=>{
        switch(t){
            case CameraType.PERSPECTIVE:
                persp.setChecked(true);
                ortho.setChecked(false);
                View.get().setCameraType(CameraType.PERSPECTIVE);
                return;
            case CameraType.ORTHOGRAPHIC:
                persp.setChecked(false);
                ortho.setChecked(true);
                View.get().setCameraType(CameraType.ORTHOGRAPHIC);
                return;
            default:
                throw new Error("Bad camera type");
        }
    };
    persp = viewmenu.addCheckItem("Perspective view", View.get().getCameraType() == CameraType.PERSPECTIVE,()=>{viewCallback(CameraType.PERSPECTIVE);});
    ortho = viewmenu.addCheckItem("Orthographic view", View.get().getCameraType() == CameraType.ORTHOGRAPHIC, ()=>{viewCallback(CameraType.ORTHOGRAPHIC);});

    viewmenu.addSeparator();

    viewmenu.addItem("+X view", ()=>{ View.get().lookDownAxis( 1, 0, 0); } );
    viewmenu.addItem("-X view", ()=>{ View.get().lookDownAxis(-1, 0, 0); } );
    viewmenu.addItem("+Y view", ()=>{ View.get().lookDownAxis( 0, 1, 0); } );
    viewmenu.addItem("-Y view", ()=>{ View.get().lookDownAxis( 0,-1, 0); } );

    //FIXME: These don't work well with OrbitControls.
    // viewmenu.addItem("+Z view", ()=>{ View.get().lookDownAxis( 0, 0, 1); } );
    // viewmenu.addItem("-Z view", ()=>{ View.get().lookDownAxis( 0, 0,-1); } );


    let runmenu = mbar.addMenu("Run");
    let runItem = runmenu.addItem("Run", () => { PythonManager.get().runCodeFromEditor(); }, "Shift+Enter");
    let stopItem = runmenu.addItem("Stop", () => { WorkerManager.get().stopWorker(); });
    stopItem.setDisabled();
    let helpmenu = mbar.addMenu("Help");
    helpmenu.addItem("Help...",()=>{ showHelp();});
    helpmenu.addItem("Simple demo", () => { showDemo(0); });
    helpmenu.addItem("Full demo", () => { showDemo(1);});
    helpmenu.addItem("About...",()=>{ showAboutDialog();});

    WorkerManager.get().registerWorkerBusyCallback( () => {
        saveItem.setDisabled();
        runItem.setDisabled();
        stopItem.setEnabled();
    });
    WorkerManager.get().registerWorkerIdleCallback( () => {
        saveItem.setEnabled();
        runItem.setEnabled();
        stopItem.setDisabled();
    });
    

    let spinnerdiv = document.createElement("div");
    spinnerdiv.style.display="inline-block";
    let spinner = new Spinner(spinnerdiv);
    mbar.mbar.appendChild(spinnerdiv);
    WorkerManager.get().registerWorkerBusyCallback( () => {
        spinner.show();
    });
    WorkerManager.get().registerWorkerIdleCallback( () => {
        spinner.hide();
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

function showDemo(which: number){
    let D = new Dialog( [
        {
            name: "Cancel",
            callback: () => { D.hide(); }
        },
        {
            name: "OK",
            callback: () => {
                if( which === 0 ){
                    Editor.get().setValue(simpleDemoCode);
                    D.hide();
                } else {
                    D.contentArea.innerHTML="Working...Please wait...";
                    fetch("demo.txt").then( (resp: Response) => {
                        resp.text().then( (txt:string) => {
                            Editor.get().setValue(txt);
                            D.hide();
                        });
                    });
                }
            }
        }
    ]);
    D.contentArea.innerHTML="This will replace the code you have in the editor. Are you OK with that?";
    D.show();
}

function conductGridDialog(){

    function fromhexcolor(s: string){
        return parseInt(s.substring(1),16);
    }
    

    let D = new Dialog( [
        {
            name: "Cancel",
            callback: () => { D.hide(); }
        },
        {
            name: "OK",
            callback: () => {
                D.hide();

            View.get().makeGrids(fromhexcolor(majorColor.value), 
                parseFloat(majorWidth.value), 
                parseFloat(majorInterval.value),
                fromhexcolor(minorColor.value), 
                parseFloat(minorWidth.value), 
                parseFloat(minorSpacing.value),
                parseFloat(extents.value), 
                xy.checked, xz.checked, yz.checked);
            }
        }
    ]);
    
    function tohexcolor(n: number){
        let tmp = n.toString(16);
        while(tmp.length < 6 )
            tmp = "0"+tmp;
        return "#"+tmp;
    }

    let div = document.createElement("div");
    D.contentArea.appendChild(div);
    let xy = makeCheckbox(div, "XY", View.get().isGridVisible(GridPlane.XY) );
    let xz = makeCheckbox(div, "XZ", View.get().isGridVisible(GridPlane.XZ) );
    let yz = makeCheckbox(div, "YZ", View.get().isGridVisible(GridPlane.YZ) );

    div = document.createElement("div");
    D.contentArea.appendChild(div);
    div.appendChild(document.createTextNode("Grid extents:"));
    let extents = document.createElement("input");
    div.appendChild(extents);
    extents.type="range";
    extents.min=""+10;
    extents.max=""+1000;
    extents.value = ""+View.get().gridExtent;

    D.contentArea.appendChild(document.createElement("hr"));
    
    div = document.createElement("div");
    D.contentArea.appendChild(div);
    div.appendChild(document.createTextNode("Major line color:"));
    let majorColor = document.createElement("input");
    majorColor.type="color";
    majorColor.value = tohexcolor(View.get().majorColor);
    div.appendChild(majorColor);

    div = document.createElement("div");
    D.contentArea.appendChild(div);
    div.appendChild(document.createTextNode("Major line interval:"));
    let majorInterval = document.createElement("input");
    majorInterval.size=8;
    majorInterval.value = ""+View.get().majorInterval;
    div.appendChild(majorInterval);

    div = document.createElement("div");
    D.contentArea.appendChild(div);
    div.appendChild(document.createTextNode("Major line width:"));
    let majorWidth = document.createElement("input");
    majorWidth.type="range";
    majorWidth.min=""+0.25;
    majorWidth.max=""+5.0;
    majorWidth.step=""+0.25;
    majorWidth.value = ""+View.get().majorWidth;
    div.appendChild(majorWidth);


    D.contentArea.appendChild(document.createElement("hr"));
    
    div = document.createElement("div");
    D.contentArea.appendChild(div);
    div.appendChild(document.createTextNode("Minor line color:"));
    let minorColor = document.createElement("input");
    minorColor.value = tohexcolor(View.get().minorColor);
    minorColor.type="color";
    div.appendChild(minorColor);

    div = document.createElement("div");
    D.contentArea.appendChild(div);
    div.appendChild(document.createTextNode("Minor line spacing:"));
    let minorSpacing = document.createElement("input");
    minorSpacing.size=8;
    minorSpacing.value = ""+View.get().minorSpacing;
    div.appendChild(minorSpacing);

    div = document.createElement("div");
    D.contentArea.appendChild(div);
    div.appendChild(document.createTextNode("Minor line width:"));
    let minorWidth = document.createElement("input");
    minorWidth.type="range";
    minorWidth.min=""+0.25;
    minorWidth.max=""+5.0;
    minorWidth.step=""+0.25;
    minorWidth.value = ""+View.get().minorWidth;
    div.appendChild(minorWidth);


    D.show();
}