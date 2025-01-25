

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

        let content = document.createElement("div");
        this.contents.push(content);
        content.classList.add("tabContent");
        this.contentContainer.appendChild(content);


        if( this.selectedTabIndex === -1 )
            this.selectTab(0);

        return content;
 
    }

    selectTab(index:number){
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
        
    }
}