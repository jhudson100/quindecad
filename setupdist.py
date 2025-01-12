#!/usr/bin/env python3

import os
import shutil

def link(existing,new):
    try:
        os.symlink(existing,new)
    except FileExistsError:
        pass
    
os.makedirs("dist/super",exist_ok=True)
shutil.copyfile("index.html","dist/index.html")
shutil.copyfile("src/about.txt","dist/about.txt")
shutil.copyfile("src/help.html","dist/help.html")

for fname in [
    "ext/ace/ace/ace.js",
    "ext/ace/ace/ext-language_tools.js",
    "ext/ace/ace/mode-python.js",
    "ext/ace/ace/theme-eclipse.js", 
    "ext/brython/brython/brython.js", 
    "ext/brython/brython/brython_stdlib.js",
    "ext/manifold/package/manifold.js",
    "ext/manifold/package/manifold.wasm", 
    "ext/three/package/build/three.core.min.js",
    "ext/three/package/build/three.module.min.js", 
    "ext/three/package/examples/jsm/controls/OrbitControls.js"
]:
    tmp = fname.split("/")
    libname = tmp[1]
    folder=f"dist/ext/{libname}"
    os.makedirs(folder,exist_ok=True)
    shutil.copyfile(fname,f"{folder}/{tmp[-1]}")

# link("../ext","dist/ext")

