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



def makePythonShims(shimfiles):
    pyfile = "src/super/pyshims.py"

    #create the python shim file
    with open(pyfile,"w") as fp:

        #standard header
        print(file=fp)
        print(file=fp)
        print("# This file is autogenerated. Do not edit.",file=fp)
        print(file=fp)
        print(file=fp)

        #add the preamble to it
        with open("preambles/pyshims.py") as fp2:
            preamble=fp2.read()
        print(preamble, file=fp)


        #scan the shims folder and extract Python code
        #from each file listed there
        for mod,funcs in shimfiles:
            assert len(funcs) == 1
            name, func = funcs[0]
            generatePythonShim(name=name, fp=fp, func=func)


def _generatePythonShim(name,fp,func):

    #marks start of function body
    rex1 = re.compile(r"(?x)  \)  \s*  ( ->\s*\w+\s* )?  :  [ \t]*  \n  ")

    #docstring, if there is one. We assume we always have triple """ quotes,
    #(not ''') used to delimit the string
    rex2 = re.compile(r'(?xs)  \s+  """.*?"""   ')


    sig = inspect.signature(func)
    pnames=[]
    for pname in sig.parameters:
        pnames.append(pname)
        pinfo = sig.parameters[pname]
        if pinfo.default != inspect.Parameter.empty:
            pnames[-1] += f"={pinfo.default}"

    print(file=fp)
    print("def",name,"(",",".join(pnames),"):",file=fp)
    src = inspect.getsource(G[name])

    #find the colon that starts the function body
    M = rex1.search(src)
    if not M:
        print(src)
        raise Exception("Could not find start of function body")

    #remove the declaration
    src2 = src[M.end():]

    #see if we have a docstring
    M = rex2.match(src2)

    #remove the docstring if it exists
    if M:
        src2 = src2[M.end():]

    src2 = src2.strip()

    tmp = src2.split("\n")
    i=0
    while i < len(tmp):
        if tmp[i].strip().startswith("#"):
            del tmp[i]
        else:
            i+=1
    src2 = "\n".join(tmp).strip()

    #generate code to check parameter types
    #if a parameter has no type annotation, then ignore it
    for pname in sig.parameters:
        pinfo = sig.parameters[pname]
        anno = pinfo.annotation
        if anno == inspect.Parameter.empty:
            continue    #no type checking

        if typing.get_origin(anno) is types.UnionType:
            #we have a union type, not just a single type

            checkers=[]
            expectedTypes=[]
            possibleTypes = anno.__args__
            for underlyingType in possibleTypes:
                checker = underlyingType.checker
                checkers.append( f"{checker}({pname})" )
                expectedTypes.append(underlyingType.name)

            expectedType = "one of: ", ",".join(expectedTypes)

            print("    if not any([",file=fp,end="")
            print(",".join(checkers),file=fp,end="")
            print("]):",file=fp)
        else:

            checker = anno.checker
            expectedType = anno.name

            if pinfo.default != inspect.Parameter.empty:
                print(f"    if {pname} != {pinfo.default} and not {checker}({pname}):",file=fp)
            else:
                print(f"    if not {checker}({pname}):",file=fp)

        print(f"        raise Exception('Parameter {pname} has wrong type (expected {expectedType})')",file=fp)

    if src2 == "pass":
        #no function body provided, so we autogenerate
        #a call to the shim function
        for pname in sig.parameters:
            #must use 'is' instead of == because if param is a JS object
            #then == will try to call python's __eq__ function,
            #and that will crash
            print(f"    if {pname} is None: {pname} = javascript.UNDEFINED",file=fp)
        tmp=[]
        for pname in sig.parameters:
            tmp.append(pname)
        print(f"    return browser.self.impl_{name}({' , '.join(tmp)})",file=fp)

    else:
        #copy the function body as-is
        print("    "+src2,file=fp)
