
let verbose=false;


export let preambleStr: string = "";
export let numPreambleLines: number = 0;

export function initialize(): Promise<boolean> {

    let p = new Promise<boolean>( (res,rej) => {
        fetch("super/pyshims.py").catch( 
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
