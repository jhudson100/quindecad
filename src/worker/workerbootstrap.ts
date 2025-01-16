//browser limitation (or bug?): In my browser,
//this can't be a module: The browser just hangs
//and never executes anything in the file.
//So we move the module stuff to another file
//and load that file from here

var __BRYTHON__: any;

let verbose=false;

if(verbose)
    console.log("worker bootstrap");

var window = self;  //so brython_stdlib will work

self.importScripts("../ext/brython/brython.js");
self.importScripts("../ext/brython/brython_stdlib.js");

import("./workermain.js").then( 
    (w:any) => {
        w.main(__BRYTHON__).then( ()=> { 
            if(verbose)
                console.log("worker main done"); 
        });
    }
);
