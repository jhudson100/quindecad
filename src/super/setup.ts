import {ErrorReporter} from "ErrorReporter";
import {View} from "View";
import {Editor} from "Editor";
import {PythonManager} from "PythonManager";
import { WorkerManager } from "WorkerManager";
import { TabSide, TabbedPanel } from "TabbedPanel";
import { HelpInfo } from "HelpInfo";
import { ClipControls } from "ClipControls";
import { setupMenubar } from "menus";
import { TreeEditor } from "TreeEditor";
import { createSplit } from "Grid";


// @ts-ignore
var ace: any = window.ace

enum SplitDirection{
    HORIZONTAL, VERTICAL
};

export function setupInterface(){

    let sizeCallback = () => {
        View.get().resize();
        Editor.get().resize();
        tabs.resize();
        ErrorReporter.get().resize();   
        helpInfo.resize();
        clipper.resize();
        edTabs.resize();
    };

    let tmp = createSplit(
        document.body,
        SplitDirection.HORIZONTAL, 
        ["auto","1fr","0.25fr"],
        [false,true],
        sizeCallback);

    tmp.container.style.width="99vw";
    tmp.container.style.height="99vh";
    let rows = tmp.cells;
    let menubardiv = rows[0];
    let viewAndEditDiv = rows[1];
    let infodiv = rows[2];

    viewAndEditDiv.style.height="100%";

    tmp = createSplit(
        viewAndEditDiv,
        SplitDirection.VERTICAL,
        ["1fr","1fr"],
        true,
        sizeCallback
    );
    
    tmp.container.style.height="100%";

    let viewdiv = tmp.cells[0];
    viewdiv.style.height="100%";
    let eddiv = tmp.cells[1];
    eddiv.style.height="100%";
    
 
    viewdiv.style.width="calc(100%)";
    viewdiv.style.height="calc(100%)";
    viewdiv.style.background="#cccccc"; //this is only seen during resizing

    View.initialize(viewdiv);

    // let eddiv = createGridCell( contentArea, currentRow,3, 1,1);
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

    tmp = createSplit(
        treetab,
        SplitDirection.HORIZONTAL,
        ["1fr","1fr"], 
        true,
        sizeCallback
    );
    tmp.container.style.height="100%";
    new TreeEditor(tmp.cells[0], tmp.cells[1]);
 

    edTabs.selectTab(1);

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
    setupMenubar(menubardiv);

    //force size computations
    sizeCallback();

}

  