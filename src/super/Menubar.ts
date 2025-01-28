

export type MenuCallback = () => void;



class MenuItem{
    callback: MenuCallback;
    item: HTMLElement;
    enabled = true;
    labelSpan: HTMLSpanElement;
    labelText: string;

    rect: DOMRect;

    //NOTE: The menuItem does not manage accelerators at all; it is up to the rest of the program
    //to handle accelerator keys and invoke the required functions at the correct time.
    //The accelerators here are just for display purposes.
    constructor(parent: HTMLElement, label: string, callback: MenuCallback, accelerator?: string)
    {
        this.callback=callback;

        let item = document.createElement("div");
        this.item=item;
        item.className = "menuItem";
        parent.appendChild(item);
         /* ref: https://stackoverflow.com/a/29579688 */
        item.style.display="flex";
        item.style.justifyContent = "space-between";
    
        this.labelSpan = document.createElement("span");
        this.labelSpan.className="menuItemText"
        item.appendChild(this.labelSpan);
        this.setLabel(label);

        let sp = document.createElement("span");
        if( accelerator ){
            sp.appendChild( document.createTextNode(accelerator) );
        } else {
            sp.appendChild( document.createTextNode(" ") );
        }
        item.appendChild(sp);
    }

    setLabel(text: string){
        while( this.labelSpan.firstChild )
            this.labelSpan.removeChild( this.labelSpan.firstChild);
        this.labelSpan.appendChild( document.createTextNode(text) );
        this.labelText = text;
    }

    getLabel(text: string){
        return this.labelText;
    }

    setDisabled(){
        this.enabled=false;
        this.item.classList.add("disabled");
    }

    setEnabled(){
        this.enabled=true;
        this.item.classList.remove("disabled");
    }

    unselect(){
        this.item.classList.remove("menuSelected");
    }
    
    select(){
        if( this.enabled ){
            this.item.classList.add("menuSelected");
        }
    }
    
    invoke(){
        if(this.callback)
            this.callback();
    }

    getRectangle(){
        if( this.rect === undefined )
            this.rect = this.item.getBoundingClientRect();
        return this.rect;
    }

    clearStoredRectangle(){
        this.rect=undefined;
    }

}

//Note: It is the callback's responsibility to update the checked/unchecked status of the menu item
export class CheckMenuItem extends MenuItem{
    checked:boolean;
    checkboxSpan: HTMLSpanElement;

    constructor(parent: HTMLElement, label: string, checked: boolean, callback: MenuCallback, accelerator?: string){
        super(parent, label, () => {
            callback();
        });

        this.checked=checked;

        this.checkboxSpan = document.createElement("span");
        this.checkboxSpan.classList.add("checkbox");
        this.checkboxSpan.appendChild( document.createTextNode( "✓" ) );
        this.labelSpan.insertBefore(this.checkboxSpan,this.labelSpan.firstChild);

        this.updateLabel();
    }
    setChecked(checked: boolean){
        this.checked=checked;
        this.updateLabel();
    }
    toggleChecked(){
        this.checked=!this.checked;
        this.updateLabel();
    }
    override setLabel(label: string){
        super.setLabel(label);

        //superclass constructor calls setLabel, so we
        //make sure we have this object before we use it
        if( this.checkboxSpan )
            this.labelSpan.insertBefore(this.checkboxSpan,this.labelSpan.firstChild);
    }
    private updateLabel(){
        //FIXME: Should be put in main.css file.
        if( this.checked ){
            this.checkboxSpan.classList.add("selected");
            this.checkboxSpan.classList.remove("unselected");
            // this.checkboxSpan.style.opacity="1";
        } else {
            this.checkboxSpan.classList.add("unselected");
            this.checkboxSpan.classList.remove("selected");
            // this.checkboxSpan.style.opacity="0.15";
        }
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

    rect: DOMRect;

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

        this.itemContainer = document.createElement("div");
        this.itemContainer.className="menuItemContainer";
        this.itemContainer.style.visibility="hidden";
        this.itemContainer.style.position="absolute";
        this.overallContainer.appendChild(this.itemContainer);

    }

    pullDown(){
        //we're pulling down this menu, so 
        //show the items and highlight the menu title
        this.itemContainer.style.visibility="visible";
        this.title.classList.add("menuSelected");
    }

    pullUp(){
        this.itemContainer.style.visibility="hidden";
        this.title.classList.remove("menuSelected");
    }

    getTitleRectangle(){
        if( this.rect === undefined )
            this.rect = this.title.getBoundingClientRect();
        return this.rect;
    }

    clearStoredRectangles(){
        this.rect = undefined;
        this.items.forEach( (item: MenuItem) => {
            item.clearStoredRectangle();
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
        return mitem;
    }

    addCheckItem(label: string, checked: boolean, callback: MenuCallback, accelerator?: string ){
        let mitem = new CheckMenuItem(this.itemContainer, label, checked, callback, accelerator);
        this.items.push(mitem);
        return mitem;
    }

    // addSubmenu( label: string ) {
    //     let m = new SubMenuItem(this.itemContainer, label );
    //     this.items.push(m);
    //     return m;
    // }
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
        this.setupMouseHandlers();
    }

    addMenu(title: string){
        let m = new Menu(title);
        this.menus.push(m);
        this.mbar.appendChild( m.overallContainer );
        return m;
    }

    setupMouseHandlers(){

        let selectedMenu: Menu = undefined;
        let selectedItem: MenuItem = undefined;

        let mouseDown=false;


        this.mbar.addEventListener("pointerdown", (ev: PointerEvent)=>{

            //clear out all cached rectangles
            //if the user has zoomed the window, the locations and sizes
            //of the bounding rectangles might have changed, so we
            //recompute them all
            this.menus.forEach( (m: Menu) => {
                m.clearStoredRectangles();
            });

            selectedMenu=undefined;
            selectedItem=undefined;

            this.mbar.setPointerCapture(ev.pointerId);

            //see if we're over a menu title.
            //if we aren't then we will ignore any future events where
            //the mouse does move over a menu title (at least until the
            //mouse gets released)
            for(let i=0;i<this.menus.length;++i){
                let r = this.menus[i].getTitleRectangle();
                if( r.left <= ev.clientX && ev.clientX <= r.right && r.top <= ev.clientY && ev.clientY <= r.bottom ){
                    //we've found a menu
                    selectedMenu = this.menus[i];
                    selectedMenu.pullDown();
                    break;
                }
            }

            //if we aren't over a menu, we don't set this to true;
            //that means pointermove events will do nothing.
            if(selectedMenu !== undefined )
                mouseDown=true;

            //always call this even if we're not over a menu title
            ev.preventDefault();
        });

        this.mbar.addEventListener("pointermove", (ev: PointerEvent) => {

            if(!mouseDown)
                return;

            //selectedMenu should never be undefined here
            if( selectedMenu === undefined)
                return;

            //start by seeing if the user is over any item of the currently pulled down menu

            let foundIt=false;
            for(let i=0;i<selectedMenu.items.length;++i){

                let menuItem = selectedMenu.items[i];

                //disabled menu items are not eligible for selection
                if( !menuItem.enabled )
                    continue;

                let r = menuItem.getRectangle();
                if( ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom ){
                    //we are over this menu item
                    //remove selection from previous item
                    if( selectedItem !== undefined && selectedItem !== menuItem ){
                        selectedItem.unselect();
                    }

                    //indicate we now have this one selected
                    selectedItem = menuItem;

                    //add highlight to the item we are over
                    selectedItem.select();
                    
                    foundIt=true;

                    //no need to look further
                    break;
                }
            }

            if(!foundIt){
                //if cursor is not over any item, remove highlight from the 
                //item that was previously selected, if there is one
                if(selectedItem){
                    selectedItem.unselect();
                    selectedItem=undefined;
                }

                //see if we're over any other menu title
                for(let i=0;i<this.menus.length;++i){
                    let r = this.menus[i].getTitleRectangle();
                    if( r.left <= ev.clientX && ev.clientX <= r.right && r.top <= ev.clientY && ev.clientY <= r.bottom ){
                        //we are over this menu
                        //if it's the same as the current menu, there's nothing to do
                        if( this.menus[i] === selectedMenu){
                        } else {
                            //otherwise, pull that menu down
                            selectedMenu.pullUp();
                            selectedMenu = this.menus[i];
                            selectedMenu.pullDown();
                        }
                    }
                }
            }
        });

        this.mbar.addEventListener("pointerup", (ev: PointerEvent) => {

            mouseDown=false;
            this.mbar.releasePointerCapture(ev.pointerId);
            
            if( selectedMenu ){
                selectedMenu.pullUp();
            }

            //if there is an item, remove the selection highlight
            if(selectedItem ){
                //run the callback
                selectedItem.invoke();  
                
                //remove highlight
                selectedItem.unselect();

                //item is no longer selected
                selectedItem = undefined;
            }
            

            ev.preventDefault();
        });
    } //end function setupMouseHandlers
} //end class Menubar