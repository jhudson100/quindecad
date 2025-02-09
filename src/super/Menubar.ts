

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
        if( this.checked ){
            this.checkboxSpan.classList.add("selected");
            this.checkboxSpan.classList.remove("unselected");
        } else {
            this.checkboxSpan.classList.add("unselected");
            this.checkboxSpan.classList.remove("selected");
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
        //make sure no items on this menu are selected
        this.items.forEach( (I: MenuItem)=>{
            I.unselect();
        });
    }

    getTitleRectangle(){
        if( this.rect === undefined )
            this.rect = this.title.getBoundingClientRect();
        return this.rect;
    }

    mouseIsOverMenuTitle(x:number, y:number){
        let r = this.getTitleRectangle();
        if( r.left <= x && x <= r.right && r.top <= y && y <= r.bottom )
            return true;
        else
            return false;
    }

    getItemUnderMouse(x:number, y:number){
        for(let i=0;i<this.items.length;++i){
            let menuItem = this.items[i];

            //disabled menu items are not eligible for selection
            if( !menuItem.enabled )
                continue;

            let r = menuItem.getRectangle();
            if( x >= r.left && x <= r.right && y >= r.top && y <= r.bottom ){
                return menuItem;
            }
        }
        return undefined;
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

    private getMenuWhoseTitleWeAreOver(x:number,y:number){
        for(let i=0;i<this.menus.length;++i){
            if( this.menus[i].mouseIsOverMenuTitle( x,y ) ){
                return this.menus[i];
            }
        }
        return undefined;
    }

    setupMouseHandlers(){

        //the menu that is currently pulled down, or undefined if none
        let pulledDownMenu: Menu = undefined;

        //menu item the mouse is over, or undefined if none
        let selectedItem: MenuItem = undefined;

        //if true, we are tracking mouse motion for menus. If false, we are not.
        //This is not the same as the mouse being down: If the user clicks
        //on a menu title, we track the mouse for menus even though the button
        //is up.
        let trackingMouseForMenus=false;

        //time when pointer was pressed down
        let pointerDownTime: number = 0;

        //coordinates where pointer was pressed down
        let pointerDownX:number = 0;
        let pointerDownY:number = 0;


        //this div captures any mouse clicks outside of the menus so
        //the user can dismiss a menu by clicking in the background.
        //if the user clicks the menu bar, we add this to the document;
        //when the user chooses a menu item or clicks in the background,
        //we remove it from the document
        let dismissdiv: HTMLElement;

        let pointerDownCallback = (ev: PointerEvent)=>{
            //only reset these if there isn't a menu open already.
            //There will be a menu open if the user clicked
            //on a menu title and then released the mouse button.
            if( pulledDownMenu === undefined ){
                pointerDownTime = ev.timeStamp;
                pointerDownX = ev.clientX;
                pointerDownY = ev.clientY;
            }

            //clear out all cached rectangles
            //if the user has zoomed the window, the locations and sizes
            //of the bounding rectangles might have changed, so we
            //recompute them all
            this.menus.forEach( (m: Menu) => {
                m.clearStoredRectangles();
            });

            this.mbar.setPointerCapture(ev.pointerId);

            //always call this even if we're not over a menu title or item
            ev.preventDefault();

            //menu whose title we are over, or undefined if none
            let menuWhoseTitleWeAreOver = this.getMenuWhoseTitleWeAreOver(ev.clientX,ev.clientY);
            if( menuWhoseTitleWeAreOver){
                if( pulledDownMenu !== menuWhoseTitleWeAreOver ){
                    if( pulledDownMenu )
                        pulledDownMenu.pullUp();
                    selectedItem=undefined;
                }
                menuWhoseTitleWeAreOver.pullDown();
                pulledDownMenu = menuWhoseTitleWeAreOver;
                trackingMouseForMenus=true;
                //we can't possibly be over a menu item since we are over
                //a title, so we don't need to look at any items.
                //The pullUp call above has cleared the selected state
                //on selectedItem, if there was one
                return;
            }
            
            //if we get here, the mouse is not over any menu title.
            //But it might be over a menu item if we have a menu pulled down
            //(and the user clicked a menu to open it instead of dragging)
            //But we don't want to take action unless the user *releases*
            //the mouse over an item, so do nothing.
            //Don't change trackingMouseForMenus: It only gets set to false
            //on a mouse up event (unless the user clicks on the background)
            //and it gets set to true only when
            //we have a mouse down event, which was handled above.

            // originallySelectedMenu   originallySelected
            //if we aren't over a menu, we don't set this to true;
            // //that means pointermove events will do nothing.
            // if(selectedMenu !== undefined )
            //     trackingMouseForMenus=true;

        };

        let pointermoveCallback = (ev: PointerEvent) => {

            if(!trackingMouseForMenus)
                return;

            //set to true if we find an item that the mouse cursor is over
            let foundIt=false;

            //see if we have a menu pulled down; if so, see if there's an item
            //on that menu that we are over
            if( pulledDownMenu !== undefined){
                let menuItem = pulledDownMenu.getItemUnderMouse(ev.clientX, ev.clientY);
                if( menuItem ){
                    foundIt = true;
                    //remove selection from previous item, if there was one
                    if( selectedItem !== menuItem ){
                        if(selectedItem)
                            selectedItem.unselect();
                        menuItem.select();
                        selectedItem = menuItem;
                    } // else there's nothing to do: It's the same menu item
                }
            }

            if(!foundIt){
                //if cursor is not over any item on the currently pulled down
                //menu. Remove highlight from the 
                //item that was previously selected, if there is one
                if(selectedItem){
                    selectedItem.unselect();
                    selectedItem=undefined;
                }

                //see if the mouse is over a different menu's title. If so,
                //pull that menu down.
                let m = this.getMenuWhoseTitleWeAreOver(ev.clientX,ev.clientY);
                if( m ){
                    if( pulledDownMenu !== m ){
                        if( pulledDownMenu )
                            pulledDownMenu.pullUp();
                        m.pullDown();
                        pulledDownMenu=m;
                    }
                }
            }
        }; //end pointer move event handler

        let pointerupCallback = (ev: PointerEvent) => {

            if(!trackingMouseForMenus)
                return;

            //if user clicks on a menu, we want to leave the menus open
            //and let the user browse them without having to hold
            //the mouse button down. We're fairly forgiving here
            //since we don't know what the system mouse sensitivity
            //settings are.
            if( ev.timeStamp - pointerDownTime < 500 &&
                Math.abs(pointerDownX - ev.clientX) < 10 &&
                Math.abs(pointerDownY - ev.clientY) < 10 ){
                    
                if( !dismissdiv.parentElement) 
                    document.body.appendChild(dismissdiv);
                //leave trackingMouseForMenus true; don't examine hit boxes;
                //don't hide any menus; don't deselect anything.
                return;
            }

            if( dismissdiv.parentElement ){
                dismissdiv.parentElement.removeChild(dismissdiv);
            }

            trackingMouseForMenus=false;
            this.mbar.releasePointerCapture(ev.pointerId);

            //hide the menu first so that if the invoke callback
            //puts up a dialog or something, the menu will
            //be gone before that happens
            if( pulledDownMenu ){
                //removes menu and highlight on selectedItem, if there is one
                pulledDownMenu.pullUp();
            }

            //if there is an item, invoke it
            if(selectedItem ){
                //run the callback
                selectedItem.invoke();  
            }
            

            selectedItem = undefined;
            pulledDownMenu=undefined;

            ev.preventDefault();
        };

        dismissdiv = document.createElement("div");
        dismissdiv.style.position="fixed";
        dismissdiv.style.left="0px";
        dismissdiv.style.top="0px";
        dismissdiv.style.width="100vw";
        dismissdiv.style.height="100vh";
        dismissdiv.classList.add("dismissdiv")
        dismissdiv.style.background="rgba(0,0,0,0)";

        this.mbar.addEventListener("pointerdown", pointerDownCallback);
        this.mbar.addEventListener("pointermove", pointermoveCallback);
        this.mbar.addEventListener("pointerup", pointerupCallback);
        dismissdiv.addEventListener("pointerdown", pointerDownCallback);
        dismissdiv.addEventListener("pointermove", pointermoveCallback);
        dismissdiv.addEventListener("pointerup", pointerupCallback);

    } //end function setupMouseHandlers
} //end class Menubar