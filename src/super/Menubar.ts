

export type MenuCallback = () => void;

class MenuItem{
    callback: MenuCallback;
    item: HTMLElement;
    constructor(parent: HTMLElement, label: string, callback: MenuCallback, accelerator?: string)
    {
        this.callback=callback;
        
        let item = document.createElement("div");
        this.item=item;
        item.className = "menuItem";
        parent.appendChild(item);
    
        let sp = document.createElement("span");
        sp.className="menuItemText"
        sp.appendChild( document.createTextNode(label) );
        item.appendChild(sp);

        sp = document.createElement("span");
        if( accelerator ){
            sp.appendChild( document.createTextNode(accelerator) );
        } else {
            sp.appendChild( document.createTextNode(" ") );
        }
        item.appendChild(sp);
    }

    getBoundingClientRect(){
        return this.item.getBoundingClientRect();
    }

    unselect(){
        this.item.classList.remove("menuSelected");
    }
    
    select(){
        this.item.classList.add("menuSelected");
    }
    
    invoke(){
        console.log("INV");
        if(this.callback)
            this.callback();
    }
}

export class Menu{
    //container that holds both title and menu items
    overallContainer: HTMLElement;

    //the menu title
    title: HTMLElement;

    //container for all the items
    itemContainer: HTMLElement;

    //the items themselves
    items: MenuItem[] = [];

    constructor(titleString: string){
        this.overallContainer = document.createElement("div");
        this.overallContainer.className="menuOverallContainer"
        this.overallContainer.style.display="inline-block";
        this.overallContainer.style.position="relative";
        this.overallContainer.style.left="0px";
        this.overallContainer.style.top="0px";
        //@ts-ignore
        this.overallContainer.style.textWrap="nowrap";

        
        this.title = document.createElement("div");
        this.overallContainer.appendChild(this.title);
        this.title.style.display="inline-block";
        this.title.className="menuTitle";
        this.title.appendChild( document.createTextNode( "\u00a0" + titleString + "\u00a0") );

        // this.titleDiv.style.background="white";
        //his.titleDiv.style.zIndex = "100";
        //@ts-ignore
        // this.titleDiv.style.textWrap="nowrap";
        // this.titleDiv.style.display="inline-block";
        // this.titleDiv.style.position="relative";
        // this.titleDiv.style.left="0px";
        // this.titleDiv.style.top="0px";

        this.itemContainer = document.createElement("div");
        this.itemContainer.className="menuItemContainer";
        this.itemContainer.style.visibility="hidden";
        this.itemContainer.style.position="absolute";
        this.overallContainer.appendChild(this.itemContainer);

        
        // this.itemContainer.style.position="absolute";
        // this.itemContainer.style.left="0px";
        // this.itemContainer.style.top="1em";
        // this.itemContainer.style.border="1px solid black";
        // this.itemContainer.style.boxShadow = "0.2em 0.2em 0.1em rgba(0,0,0,0.5)";


        let selectedItem: number=-1;
        let mouseDown=false;
        let itemRectangles: DOMRect[] = [];

        this.title.addEventListener("pointerdown", (ev: PointerEvent)=>{
            console.log("Capture");
            selectedItem=-1;
            this.title.setPointerCapture(ev.pointerId);
            this.itemContainer.style.visibility="visible";

            //if user has zoomed the window, the item rectangles might have changed, so we recompute them here
            this.items.forEach( (item: MenuItem, idx: number) => { // (item: HTMLDivElement, idx: number) => {
                itemRectangles[idx] = item.getBoundingClientRect();
            });

            mouseDown=true;
            this.title.classList.add("menuSelected");
            ev.preventDefault();
        });

        this.title.addEventListener("pointermove", (ev: PointerEvent) => {
            if(!mouseDown)
                return;
            let foundIt=false;
            for(let i=0;i<itemRectangles.length;++i){
                let r = itemRectangles[i];
                if( ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom ){

                    //remove highlight from the item that we're no longer over
                    if( selectedItem !== -1 && selectedItem !== i ){
                        this.items[selectedItem].unselect();
                        // this.items[selectedItem].classList.remove("menuSelected");
                    }
                    selectedItem = i;

                    //add highlight to the item we are over
                    this.items[selectedItem].select();
                    // this.items[selectedItem].classList.add("menuSelected");
                    foundIt=true;
                    break;
                }
            }
            if(!foundIt){
                //if cursor is not over any item, remove highlight from the previous item,
                //if there is one
                if(selectedItem !== -1 ){
                    this.items[selectedItem].unselect();
                    // this.items[selectedItem].classList.remove("menuSelected");
                    selectedItem=-1;
                }
            }
        });

        this.title.addEventListener("pointerup", (ev: PointerEvent) => {
            console.log("Release"); 
            mouseDown=false;
            this.title.releasePointerCapture(ev.pointerId);
            this.itemContainer.style.visibility="hidden";
            console.log("Selected",selectedItem);

            //if there is an item, remove the selection highlight
            if(selectedItem !== -1 ){
                this.items[selectedItem].invoke();
                this.items[selectedItem].unselect();
                // this.items[selectedItem].classList.remove("menuSelected");
                selectedItem=-1;
            }
            this.title.classList.remove("menuSelected");
            ev.preventDefault();
        });
    }

    addSeparator(){
        let item = document.createElement("div");
        item.className = "menuSeparator";
        this.itemContainer.appendChild(item);
        item.appendChild( document.createTextNode("\u00a0") );
    }

    addItem(label: string, callback: MenuCallback, accelerator?: string ){
        let mitem = new MenuItem(this.itemContainer, label, callback, accelerator);
        this.items.push(mitem);

        // let item = document.createElement("div");
        // item.className = "menuItem";
        // this.itemContainer.appendChild(item);
        
        // let sp = document.createElement("span");
        // sp.appendChild( document.createTextNode(label) );
        // sp.style.paddingRight="2em";
        // item.appendChild(sp);

        // sp = document.createElement("span");
        // if( accelerator ){
        //     sp.appendChild( document.createTextNode(accelerator) );
        // } else {
        //     sp.appendChild( document.createTextNode(" ") );
        // }
        // item.appendChild(sp);

        // this.items.push(item);
    }


}

export class Menubar{

    parent: HTMLElement;

    mbar: HTMLDivElement;

    menus: Menu[] = [];

    constructor(parent: HTMLElement){
        this.parent=parent;
        this.mbar = document.createElement("div");
        this.mbar.className="menubar";
        this.parent.appendChild(this.mbar);
    }

    addMenu(title: string){
        let m = new Menu(title);
        this.menus.push(m);
        this.mbar.appendChild( m.overallContainer );
        return m;
    }

}