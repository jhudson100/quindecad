
export enum SplitDirection{ HORIZONTAL, VERTICAL};

export class Splitter{
    parent: HTMLElement;
    splitDirection: SplitDirection;

    //numSplits should be at least 1 (to make 2 regions)
    constructor(parent: HTMLElement, direction: SplitDirection, numSplits: number){
        this.parent = parent;
        
    }
}