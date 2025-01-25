

export class TabbedPanel{
    parent:HTMLElement;     //parent of tabs
    
    overallContainer:HTMLElement;  //container for headerContainer and contentContainer
    headerContainer: HTMLElement;   //container for the headers
    contentContainer: HTMLElement;  //container for the content

    headers: HTMLElement[] = [];
    contents: HTMLElement[] = [];

    selectedTabIndex=-1;

    constructor(parent:HTMLElement){
        this.parent=parent;
        this.overallContainer=document.createElement("div");
        this.overallContainer.classList.add("tabOverallContainer");
        parent.appendChild(this.overallContainer);
        
        this.headerContainer = document.createElement("div");
        this.headerContainer.classList.add("tabHeaderContainer");
        this.overallContainer.appendChild(this.headerContainer);

        this.contentContainer = document.createElement("div");
        this.contentContainer.classList.add("tabContentContainer");
        this.overallContainer.appendChild(this.contentContainer);

    }

    addTab(name: string){
        let header = document.createElement("div");
        header.appendChild(document.createTextNode(name));
        header.classList.add("tabHeader");
        this.headers.push(header);
        this.headerContainer.appendChild(header);
        header.addEventListener("click",(ev:MouseEvent)=>{
            //we do this since we might support removing
            //tabs in the future, and that would 
            //result in the index changing
            let idx = this.headers.findIndex( (v: HTMLElement) => { return v === header; } );
            this.selectTab(idx);
            ev.preventDefault();
        });

        let content = document.createElement("div");
        this.contents.push(content);
        content.classList.add("tabContent");
        this.contentContainer.appendChild(content);


        if( this.selectedTabIndex === -1 )
            this.selectTab(0);

        this.resize();

        return content;
 
    }

    selectTabByElement(elem: HTMLElement){
        let idx = this.contents.findIndex( (e: HTMLElement) => { return e === elem } );
        this.selectTab(idx);
    }

    selectTab(index:number){
        if( index <  0 || index >= this.headers.length ){
            console.warn("Bad index for selectTab");
            return;
        }

        if( index === this.selectedTabIndex)
            return;

        this.selectedTabIndex=index;

        for(let i=0;i<this.headers.length;++i){
            this.headers[i].classList.remove("tabActive");
            this.contents[i].classList.remove("tabActive");
        }
        this.headers[index].classList.add("tabActive");
        this.contents[index].classList.add("tabActive");
    }

    resize(){
        let r =this.parent.getBoundingClientRect();
        let hr = this.headerContainer.getBoundingClientRect();
        let availw = r.width;
        let availh = r.height-hr.height;
        // console.log("Tab content is allocated: "+availw+"x"+availh );
        this.contentContainer.style.height=availh+"px";
        this.contents.forEach( (e: HTMLElement) => {
            e.style.width=availw+"px";
            e.style.height=availh+"px";
        });
    }
}