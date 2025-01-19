
let verbose=false;

//FIXME: Allow named colors
//FIXME: Should functions that take x,y,z instead take a vec3? Same with sizes.

export let preambleStr: string = "";
export let numPreambleLines: number = 0;

export function initialize(): Promise<boolean> {

    let p = new Promise<boolean>( (res,rej) => {
        fetch("super/pyshims.txt").catch( 
            (reason: any) => { 
                rej(reason); 
            } 
        ).then( (resp: Response) => {
            resp.text().catch(
                (reason: any) => { 
                    rej(reason); 
                }
            ).then( (txt:string) => {
                let tmp = txt.split("\n");
                numPreambleLines = tmp.length;
                preambleStr = txt;
                res(true);
            });
        });
    });
    return p;
}
