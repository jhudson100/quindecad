import { ArgSpec, FuncSpec, getPreambleFunctionInfo } from "pyshimdoc";

// @ts-ignore
let ace = window.ace;

// https://ace.c9.io/#nav=howto
// https://ajaxorg.github.io/ace-api-docs/index.html
// https://stackoverflow.com/questions/28043954/keydown-event-on-ace-editor
// https://ajaxorg.github.io/ace-api-docs/classes/src_autocomplete.Autocomplete.html

//Note: Can use ed.textInput.getElement() to get HTML text area element
// (ed = name of Ace edit object)

type KeyCallback = () => void;
type KeyEventCallback = (ev: KeyboardEvent) => void;

export const simpleDemoCode=`# example code
# Press shift+enter to run or click
# the "Run" button above.
# Use the Help menu to get a more full-featured demo.
 
c = cube(xsize=3,ysize=2,zsize=1,centered=True,color=(255,255,0))
s = sphere(x=0, y=0, z=0, radius=1.5)
d = difference([c,s])
draw(d)
print("Hello, world!")

`


let completions: Map<string,string[]> = new Map();
let functionsByName : Map<string, FuncSpec> = new Map();

getPreambleFunctionInfo().forEach( (fs: FuncSpec) => {
    functionsByName.set(fs.name,fs);
    for(let i=1;i<=fs.name.length;++i){
        let prefix = fs.name.substring(0,i);
        if( !completions.has(prefix) ){
            // console.log("SET:",prefix);
            completions.set(prefix,[]);
        }
        completions.get(prefix).push(fs.name);
    }
});

function isalnum(ch:string){
    for(let i=0;i<ch.length;++i){
        if( ch[i] === '_' || (ch[i] >= '0' && ch[i] <= '9') || (ch[i] >= 'A' && ch[i] <= 'Z') || (ch[i] >= 'a' && ch[i] <= 'z' ) ){
        } else {
            return false;
        }
    }
    return true;
}

interface Position{
    row: number;
    column: number;
}

//caption = shows up in pop-up list
//value = Gets inserted into the document
//meta = shows up on right side of list
interface Hint{
    name: string;
    value: string;
    caption: string;
    meta: string;
    score: number;
}

//ref: https://plnkr.co/edit/6MVntVmXYUbjR0DI82Cr?p=preview&preview
let mycompleter = {
    getCompletions: (editor: any, session: any, pos: Position, prefix: string, callback: any) => {


        let line: string = "";
        if( pos && pos.row ){
            line = session.getLine(pos.row);
        }

        // console.log("GET COMPLETIONS for prefix:",prefix,"pos=",pos,"line=",line);

        let hints: Hint[] = [];

        let preceding = line.substring(0,pos.column);

        // console.log("preceding=",preceding);

        let displayDetailed="";
        if( preceding.length > 0 && preceding[preceding.length-1] === "(" ){
            let funcname="";
            //i points to '('
            let i=preceding.length-1;
            //move i backwards until it points to a letter/number/underscore
            while( i>=0 && !isalnum(preceding[i]) )
                i--;
            let j=i;
            while( j>=0 && isalnum(preceding[j]) )
                j--;
            //word goes from j+1...i inclusive
            let word = "";
            if( j+1 <= i ){
                word = preceding.substring(j+1,i+1);
            }
            if( functionsByName.has(word) ){
                displayDetailed=word;
            }
        }

        if( !displayDetailed ){
            if( functionsByName.has(prefix) )
                displayDetailed=prefix;
        }

        if(displayDetailed){
            let word = displayDetailed;
            let fs = functionsByName.get(word);
            let args: string[] = [];
            fs.args.forEach( (a: ArgSpec )=> {
                let txt=a.argname;
                if( a.defaultValue )
                    txt += "="+a.defaultValue;
                args.push(txt);
            });
            let astring = args.join(", ");

            let value="";
            if( preceding.length > 0 && preceding[preceding.length-1] === "(" )
                value = astring;
            else
                value = word+"("+astring+")";

            hints.push( {
                name: "name",
                value: value,
                caption: `${word}(${astring})`,
                meta: "builtin",
                score: 100
            });
        } else if( preceding.length === 0 ){
            functionsByName.forEach( (value: FuncSpec,key: string) => {
                let fname = value.name;
                hints.push( {
                    name: "name",
                    value: fname,
                    caption: fname,
                    meta: "builtin",
                    score: 100
                });
            });
        } else if( completions.has(prefix) ){
            completions.get(prefix).forEach( (fname: string) => {
                hints.push( {
                    name: "name",
                    value: fname,
                    caption: fname,
                    meta: "builtin",
                    score: 100
                });
            });
        } else {
            console.log("completions does not have",preceding);
        }

        console.log(hints.length+" hints:",hints);

        //work backwards to see if there's an opening paren
        // let nestingLevel=1;
        // let i=line.length-1;
        // while(i>=0 && nestingLevel > 0 ){
        //     if(preceding[i] == '(')
        //         nestingLevel--;
        //     else if( preceding[i] == ')')
        //         nestingLevel++;
        //     i--;
        // }

        // if( nestingLevel === 0 ){
        //     //the word before the paren is the function
        //     //that we're doing
        // } else {
        //     //we didn't find a function, so just give a list of builtins
        //     preambleFuncs.forEach( (fs: FuncSpec) => {


        //     });
        // }            

        callback(null, hints );
        
    }
};

export class Editor{

    private static instance: Editor;
    ed: any;    //the Ace instance
    localStorage: Storage|undefined = undefined;
    parent: HTMLElement;

    static get(){
        if(!this.instance){
            this.instance = new Editor();
        }
        return this.instance;
    }

    initialize(parent: HTMLElement){
        this.parent=parent;
        parent.style.fontSize = "12pt";
        
        //ref: https://stackoverflow.com/questions/13545433/autocompletion-in-ace-editor
        let languageTools = ace.require("ace/ext/language_tools");


        this.ed = ace.edit(parent);


        //to have a more extensive list:
        //set enableBasicAutocompletion, enableSnippets,
        //and enableLiveAutocompletion to true
        //Then call languageTools.addCompleter(mycompleter);
        this.ed.setOptions({
            fixedWidthGutter: true,
            useSoftTabs: true,
            enableBasicAutocompletion: [mycompleter],
            //~ enableSnippets: true,
            //~ enableLiveAutocompletion: true
        });
        //~ languageTools.addCompleter(mycompleter);

        this.ed.setTheme("ace/theme/eclipse");
        this.ed.session.setMode("ace/mode/python");

        //ref: https://stackoverflow.com/questions/44807283/how-to-resize-the-auto-suggestion-menu-width-in-ace-editor
        // this.ed.completer.popup.container.style.width="20em";



        let code = simpleDemoCode;
        try{
            this.localStorage = window.localStorage;
            if( this.localStorage ){
                let c = this.localStorage.getItem("code");
                if(c)
                    code=c;

            }
        } catch(e){
            //user might have configured browser to reject storage
        }
        this.ed.setValue(code,-1);

        //save a copy every five minutes
        setInterval( ()=>{
            this.saveContentsToLocalStorage();
        }, 5*60*1000 );

        this.resize();
    }

    resize(){
        this.ed.resize();
    }

    saveContentsToLocalStorage(){
        if(this.localStorage ){
            this.localStorage.setItem("code",this.ed.getValue());
        }
    }

    moveCursorTo(line: number, col: number){
        //line = 1-based; col=0-based
        //but ace uses 0-based line numbers
        this.ed.moveCursorToPosition( {row:line-1, column: col } );
        this.ed.selection.setRange( { start: {row: line-1, column: col}, end: {row: line-1, column: col} } );
    }

    scrollTo(line:number){
        this.ed.scrollToLine(line-1,true,true);
    }

    takeFocus(){
        this.ed.focus();
    }

    //this is useful for adding commands to Ace. addKeyEventCommand
    //is useful for keydown event handling.
    addKeyboardCommand(name: string, callback: KeyCallback, 
            macKeySpec: string, winKeySpec: string){
        //mac key spec is something like "cmd-f"
        //win key spec is something like "ctrl-f"

        this.ed.commands.addCommand( {
            name:name,
            exec: callback,
            bindKey: {
                mac: macKeySpec,
                win: winKeySpec
            }
        });

    }

    //see comment on addKeyboardCommand for more information.
    addKeyEventCommand( callback: KeyEventCallback ){
        this.ed.textInput.getElement().addEventListener("keydown",
            (ev: KeyboardEvent) => {
                callback(ev);
            }
        );
    }


    getValue(saveCopyToLocalStorage: boolean): string {
        if(saveCopyToLocalStorage){
            this.saveContentsToLocalStorage();
        }
        return this.ed.getValue();
    }

    setValue(s: string){
        this.ed.setValue(s,-1); //-1=put cursor at start
    }

    getPlatformForShortcuts(){
        let platform = this.ed.keyBinding.$defaultHandler.platform;
        return platform;
    }

    getKeyboardShortcuts(){

        //we can get the editor's current keybindings like so
        // console.log(this.ed.keyBinding);
        let commands = this.ed.keyBinding.$defaultHandler.commands;
        let platform = this.ed.keyBinding.$defaultHandler.platform;
        
        let shortcuts = new Map<string,string>();

        Object.getOwnPropertyNames(commands).forEach( (name: string) => {
            let bk = commands[name].bindKey;
            if( bk && bk[platform] ){
                shortcuts.set(name,bk[platform]);
                // console.log(name, bk[platform] ?? bk);
            // } else {
                // console.log(name,"<no key>");
            }
        });
        return shortcuts;
    }
    
    executeCommand(cmd: string){
        this.ed.execCommand(cmd);
        //force one of the commands to run
        // this.ed.execCommand("showSettingsMenu");
    }

    blur(){
        this.ed.blur();
    }

}
