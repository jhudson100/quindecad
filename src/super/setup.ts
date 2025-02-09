import {ErrorReporter} from "./ErrorReporter.js";
import {Editor} from "./Editor.js";
import {PythonManager} from "./PythonManager.js";
import { WorkerManager } from "./WorkerManager.js";
import { TabbedPanel } from "./TabbedPanel.js";
import { QuickReference } from "./QuickReference.js";
import { ClipControls } from "./ClipControls.js";
import { createSplit } from "./Grid.js";
import { setupMenubar } from "./menus.js";
import { View } from "./View.js";


// @ts-ignore
var ace: any = window.ace

enum SplitDirection{
    HORIZONTAL, VERTICAL
};

export function setupInterface(){

    let SIZER_SIZE="10px";

    let sizeCallback = () => {
        // viewAndEditDiv.style.height=
        View.get().resize();
        Editor.get().resize();
        tabs.resize();
        ErrorReporter.get().resize();   
        helpInfo.resize();
        clipper.resize();
    };

    let tmp = createSplit(
        document.body,
        SplitDirection.HORIZONTAL, 
        ["auto","1fr","0.25fr"],
        SIZER_SIZE,
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
        SIZER_SIZE,
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
    Editor.get().initialize(eddiv);
    Editor.get().addKeyEventCommand( (ev: KeyboardEvent) => {
        if( ev.shiftKey && ev.key === "Enter" ){
            ev.preventDefault();
            ev.stopPropagation();
            if( !WorkerManager.get().isWorkerBusy()){
                PythonManager.get().runCodeFromEditor();
            }
        }
    });

    
    let div = document.createElement("div");
    div.innerText="FOO!";
    tmp.cells[1].appendChild(div);
 
    //ref: https://blog.jim-nielsen.com/2023/width-and-height-in-css/
    //width looks up the tree and sets node to be as wide as widest parent
    //height looks down the tree and sets height to be maximum of children's heights
    infodiv.style.height="100%";


    let tabs = new TabbedPanel(infodiv);

    ErrorReporter.get().initialize(tabs.addTab("Output"),tabs);
    let helpInfo = new QuickReference(tabs.addTab("Help"));
    let clipper = new ClipControls(tabs.addTab("Clipping"));

   
    window.addEventListener("resize", () => {
        sizeCallback();
    });


    //must be after editor has been created
    setupMenubar(menubardiv);

    //force size computations
    sizeCallback();

}
