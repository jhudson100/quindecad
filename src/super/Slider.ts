
type ChangeListener = (value:number) => void;

export class Slider{
    listeners:ChangeListener[]=[]
    min:number;
    max: number;
    value: number;
    slider: HTMLInputElement;
    inp: HTMLInputElement;

    constructor(parent: HTMLElement, initial: number, min: number, max: number, displayWidth: string){

        this.min=min;
        this.max=max;
        this.value=initial;

        this.slider = document.createElement("input");
        parent.appendChild(this.slider);
        
        this.slider.type="range";
        this.slider.min=""+min;
        this.slider.max=""+max;
        this.slider.value=""+initial;
        this.slider.step="any";
        this.slider.style.width=displayWidth;

        this.inp = document.createElement("input");
        parent.appendChild(this.inp);        
        this.inp.size=5;
        this.inp.value=""+initial;
        this.inp.addEventListener("change", ()=>{

            let v = parseFloat(this.inp.value);
            if( isNaN(v) || v < this.min || v > this.max ){
                this.inp.classList.add("invalidValue");
                return;
            }

            this.value = v;
            //we don't reformat the value in the input,
            //but we do remove the 'invalid' class
            this.inp.classList.remove("invalidValue");
            this.slider.value = this.inp.value;
            this.callListeners();
        });

        this.slider.addEventListener("input", ()=>{
            let v = parseFloat(this.slider.value);
            this.value=v;
            this.makeInputPretty(v);
            this.callListeners();
        });
    }

    addListener( f: ChangeListener ) {
        this.listeners.push(f);
    }

    private makeInputPretty(v:number){
        //in case we had an invalid value
        this.inp.classList.remove("invalidValue");

        //it would look ugly to have something like 1.000000121421 as 
        //a current value, so we truncate the displayed value to a limited
        //number of decimal places and remove trailing zeros

        //Note: This will use scientific notation for large numbers
        let s = v.toFixed(3);

        //determine what character we use for a decimal point.
        //Most often . or ,
        //ref: https://stackoverflow.com/questions/2085275/what-is-the-decimal-separator-symbol-in-javascript
        let decimalPoint: string = (1.25).toLocaleString().substring(1,2);

        //chop off trailing zeros if we have a decimal point
        if( s.indexOf(decimalPoint) !== 0 && s.indexOf("E") === -1 && s.indexOf("e") === -1 ){
            while( s.length > 0 && s[s.length-1] == '0' ){
                s=s.substring(0,s.length-1);
            }
        }
            
        //if string ends with a decimal point, put one zero back on
        if( s[s.length-1] ===  decimalPoint )
            s += "0";

        this.inp.value = s;
    }

    //this does not call any callbacks, and it does not
    //check to see if v is out of range
    setValue(v: number){
        this.value=v;
        this.makeInputPretty(v);
        this.slider.value=v+"";
    }

    setRange(min: number, max: number, callCallbacksIfCurrentIsOutOfRange:boolean){
        this.min=min;
        this.max=max;
        this.slider.min = ""+this.min;
        this.slider.max = ""+this.max;
        if( this.value < min ){
            this.slider.value = min+"";
            this.inp.value = min+"";
            this.value = min;
            if(callCallbacksIfCurrentIsOutOfRange)
                this.callListeners();
        }
        if( this.value > max ){
            this.slider.value = min+"";
            this.inp.value = min+"";
            this.value = min;
            if(callCallbacksIfCurrentIsOutOfRange)
                this.callListeners();
        }
    }

    private callListeners(){
        this.listeners.forEach( (f: ChangeListener) => {
            f(this.value);
        });
    }
}
