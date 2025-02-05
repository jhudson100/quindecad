// @ts-ignore
import Split from 'Split';
enum SplitDirection{
    HORIZONTAL, VERTICAL
};

export function createSplit(parent: HTMLElement,
        splitDirection: SplitDirection,
        sizes: string[],        //ex: 1fr 1fr. Must be in units of fr or px
        sizerSize: string,      //ex: 10px. Must be in units of fr or px
        createSizers: boolean[]|boolean,    //if createSizers[i] is true, create a sizer between cells i and i+1
                                            //if createSizers is a boolean, treat it like a list of that particular boolean.
        resizeCallback: ()=>void)
{

    let sizerFlagList: boolean[] = [];
    if( typeof createSizers === "boolean" ){
        for(let i=0;i<sizes.length-1;++i){
            sizerFlagList.push( createSizers as boolean);
        }
    } else {
        sizerFlagList = createSizers as boolean[];
    }
    if( sizerFlagList.length !== sizes.length-1 ){
        throw new Error("Bad length for createSizers");
    }

    //Split.js can't work with em's here; px work though
    let div = document.createElement("div");
    div.style.display="grid";

    let sizespec: string[] = [];
    for(let i=0;i<sizes.length;++i){
        sizespec.push(sizes[i]);
        if( i < sizes.length-1 && sizerFlagList[i] )
            sizespec.push(sizerSize);
    }

    if( splitDirection === SplitDirection.HORIZONTAL ){
        div.style.gridTemplateRows = sizespec.join(" ");
        div.style.gridTemplateColumns = "1fr";
    } else {
        div.style.gridTemplateRows = "1fr";
        div.style.gridTemplateColumns = sizespec.join(" ");
    }

    //make grid cells and sizers
    let row=1;
    let col=1;
    let deltar=(splitDirection === SplitDirection.HORIZONTAL ? 1:0 );
    let deltac=(splitDirection === SplitDirection.VERTICAL ? 1:0 );
    let gutters: any[] = [];

    let cells:HTMLElement[]=[];
    for(let i=0,j=1;i<sizes.length;++i){
        let ch = makeGridCell(row,col);
        div.appendChild(ch);
        cells.push(ch);
        row += deltar;
        col += deltac;
        j++;
        if( i !== sizes.length-1 && sizerFlagList[i]){
            //make sizer
            ch = makeGridCell(row,col);
            ch.classList.add("sizer");
            ch.classList.add( splitDirection===SplitDirection.HORIZONTAL ? "horizontalSizer" : "verticalSizer");
            //css uses 1-based indexing; split-grid uses 0-based...
            gutters.push({ track: j-1, element: ch } );
            div.appendChild(ch);
            row += deltar;
            col += deltac;
            j++;
        }
    }

    let splitOptions:any  = {}
    if( splitDirection===SplitDirection.HORIZONTAL)
        splitOptions.rowGutters = gutters;
    else
        splitOptions.columnGutters = gutters;
    splitOptions.onDragEnd = (direction: string, track: number) => {
        if( resizeCallback )
            resizeCallback();
    };

    Split(splitOptions);

    parent.appendChild(div);
    return { container: div, cells: cells };
}
    
function makeGridCell(row:number, col:number)
{
    let ch = document.createElement("div");
    ch.style.gridRowStart = ""+row;
    ch.style.gridRowEnd = ""+row;
    ch.style.gridColumnStart = ""+col;
    ch.style.gridColumnEnd = ""+col;
    ch.style.overflow="hidden";
    return ch;
}
