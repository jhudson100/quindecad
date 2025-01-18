
import enum
import typing
import inspect
import sys
import re
import os
import os.path
import types
import importlib
from shims.gluetypes import *

def makeTSImpl(shimfiles):
    tsfile = "../src/worker/tsshims.ts"

    with open(tsfile,"w") as fp:
        print(file=fp)
        print(file=fp)
        print("//This file is autogenerated. Do not edit.",file=fp)
        print(file=fp)
        print(file=fp)

        with open("preambles/tsshims.ts") as fp2:
            preamble=fp2.read()

        print(preamble, file=fp)

        for mod,funcs in shimfiles:
            for name,func in funcs:
                ts = mod.__getattribute__("TS")
                if ts == None:
                    #don't create a TS shim for this
                    pass
                else:
                    generateTSShim(name=name, func=func, ts=ts, fp=fp)


def generateTSShim(name,func,ts,fp):
    sig = inspect.signature(func)

    returns = sig.return_annotation
    if returns == inspect.Signature.empty:
        raise Exception("Function",name,"has no return type annotation")

    tmp=[]
    for pname in sig.parameters:
        pinfo = sig.parameters[pname]
        anno = pinfo.annotation
        if anno == inspect.Parameter.empty:
            jstype="any"
        else:
            jstype = jstypemap[anno]

        tmp.append(f"{pname} : {jstype}")

    print(f"type {name}_t = ( {','.join(tmp)} ) => {jstypemap[returns]} ;",file=fp)
    print(f"declare global {{",file=fp)
    print(f"    interface WorkerGlobalScope {{ impl_{name} : {name}_t }}",file=fp)
    print(f"}};",file=fp)
    print(file=fp)
    print(f"self.impl_{name} = ( {','.join(tmp)} ) : {jstypemap[returns]} => {{",file=fp)
    print(ts,file=fp)
    print(f"}}",file=fp)
