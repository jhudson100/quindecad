import {Editor} from "Editor";
import { TabbedPanel } from "TabbedPanel";
// import { preambleList } from "PythonBuiltins";

export class ErrorReporter{
    div: HTMLElement;
    parent: HTMLElement;
    tabs: TabbedPanel;

    private static instance : ErrorReporter;

    private constructor(){
        //ref: https://www.geeksforgeeks.org/how-to-force-child-div-to-be-100-of-parent-divs-height-without-specifying-parents-height/
        //note: Parent's CSS display must be flex or grid
        this.div = document.createElement("div");
        this.div.style.height="100%";

        this.div.style.width="500px";

        this.div.style.overflow="scroll";
        this.div.style.whiteSpace="pre";
        this.div.style.fontFamily="monospace";
        //FIXME: Font size
        this.clear();
    }

    clear(){
        this.div.innerHTML="";
        this.div.scrollTop=0;
    }

    // nothingToReport(){
    //     let msg = document.createElement("div");
    //     msg.appendChild(document.createTextNode("Error messages will appear here"));
    //     msg.style.color="#cccccc";
    //     this.div.appendChild(msg);
    // }

    initialize(parent: HTMLElement, tabs: TabbedPanel){
        this.parent=parent;
        this.tabs=tabs;
        parent.appendChild(this.div);
        this.resize();
    }

    resize(){
        let r = this.parent.getBoundingClientRect();
        this.div.style.width=r.width+"px";
        this.div.style.height=r.height+"px";
    }

    static get() {
        if( !ErrorReporter.instance )
            ErrorReporter.instance = new ErrorReporter();
        return ErrorReporter.instance;
    }


    //for linenums, positions, deltaLine: See reportError.
    //n=index in linenums we want to use
    //text=Visible text of the link
    makeClickableLink(
            linenums: number[],
            positions: number[][],
            n: number,
            deltaLine: number,
            text: string)
    {
        let errline: number=0;

        if( linenums !== undefined && linenums.length && linenums.length > n ){
            errline = linenums[n] - deltaLine;
        }

        let firstcol=0;
        let lastcol=0;

        // let erroneousPythonCode = textByLines[errline-1];

        let txt = `${text}`
        if( linenums.length > 0 ){
            txt += ` on line ${errline}`;
        } else {
            txt += "(unknown line number)";
        }

        if(positions.length > n && positions[n] ){
            firstcol = positions[n][1];
            lastcol = positions[n][2];
            txt += `, columns ${firstcol}...${lastcol}: `;
        } else {
            txt += ": ";
        }

        let a = document.createElement("a");
        a.style.color = "blue";
        a.style.fontWeight = "bold";
        a.style.textDecoration = "underline";
        a.style.cursor="pointer";
        a.addEventListener("click", (ev: Event) => {
            Editor.get().moveCursorTo( errline, firstcol );
            //FIXME: Should we select entire range?
            Editor.get().scrollTo(errline);
            Editor.get().takeFocus();
            ev.preventDefault();    //otherwise, the focus will be stolen from the editor
            ev.stopPropagation();
        });

        a.appendChild(document.createTextNode(txt));
        return a;
    }

    //linenums = list of line numbers in source code where there
    // was an error (list since we have a stack traceback;
    // last entry = most recent line with error
    //positions = list of three-tuple of [starting column, starting column, ending column]
    //explanations = list of humanly readable messages; these are not
    //keyed to the line numbers.
    //deltaLine = Apply offset of -deltaLine to reported line numbers
    //  since we prepend some code 
    //  before we send it to the Python interpreter -- the
    //  user doesn't see that code so we need to adjust the reported
    //  error positions to match what the user does see
    reportError(linenums: number[],
                positions: number[][],
                explanations: string[],
                deltaLine: number)
    {
        //it's possible that linenums and positions are empty
        //while explanations is not.
        
        //remove any line numbers and/or positions for the preamble
        //so the error is reported in the user code
        while( linenums.length > 0 && linenums[ linenums.length-1 ] < deltaLine ){
            let li = linenums[linenums.length-1];
            console.log("Error in preamble line "+li);
            // console.log("Preamble line: "+preambleList[li-1]);
            linenums.pop();
            if( positions.length )
                positions.pop();
        }

        let messages: Node[] = [];
        if( linenums.length > 0 ){
            let a = this.makeClickableLink(
                linenums,positions,linenums.length-1, deltaLine, "Error"
            )
            messages.push(a);
            a.click();  //go to the spot of the error
        }

        explanations.forEach( (expl: string) => {
            messages.push( document.createTextNode(expl) );
        });

        for(let i=linenums.length-2;i>=0;--i){
            messages.push(
                this.makeClickableLink( linenums, positions, i, deltaLine, "Called from code" )
            );
        }
        messages.forEach( (s: Node) => {
            let div = document.createElement("div");
            div.appendChild(s);
            this.div.appendChild(div);
            this.tabs.tabWantsAttention(this.parent);
        });
        this.div.scrollTop=0;
    }

    addMessage(s: string, color?: string){
        if(!color)
            color="#000000";
        let d = document.createElement("div");
        d.appendChild(document.createTextNode(s));
        d.style.color=color;
        this.div.appendChild(d);
        this.tabs.tabWantsAttention(this.parent);
    }

    scrollToBottom(){
        this.div.scrollTop=99999999;
    }

} //end class ErrorReporter
