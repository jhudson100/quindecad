
class PropertyEditor{
    
    propertyContainer: HTMLElement;

    constructor(propertyContainer: HTMLElement){
                
        this.propertyContainer=propertyContainer;

        let propertyScroller = document.createElement("div");
        propertyScroller.style.overflow="scroll";
        propertyScroller.style.height="100%";
        this.propertyContainer.appendChild(propertyScroller);
    }
}
