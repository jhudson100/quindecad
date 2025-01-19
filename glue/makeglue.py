#!/usr/bin/env python3

#make the Python glue between the user's Python code and the JS implementation.
#Also make the JS implementations.

import enum
import typing
import inspect
import sys
import re
import os
import os.path
import types
import importlib


import makedocfile
import makepython
import makets

#TODO: mirror, refine, refineToTolerance, slice, split


shimfiles=[]


def getFunctionsInFile(fname):
    mod = importlib.import_module(f"shims.{fname[:-3]}")
    #ref: https://stackoverflow.com/questions/31465702/how-do-i-programatically-find-what-symbols-were-imported-with-python-import-co
    if hasattr(mod,"__all_"):
        n = mod.__all__
    else:
        n = dir(mod)

    things = []
    for name in n:
        if name.startswith("_"):
            continue
        thing = mod.__getattribute__(name)
        if inspect.isfunction( thing ):
            things.append( (name,thing) )
    return mod,things



#scan the shims folder and extract Python code
#from each file listed there
shimdir = os.path.join( os.path.dirname(__file__), "shims" )
for fname in sorted(os.listdir(shimdir)):
    if fname.endswith(".py"):
        shimfiles.append( getFunctionsInFile(fname) )


def main():

    makepython.makePythonShims(shimfiles)
    makedocfile.makeDocFile(shimfiles)
    makets.makeTSImpl(shimfiles)

main()

 