#!/usr/bin/env python3

import os
import shutil

def link(existing,new):
    try:
        os.symlink(existing,new)
    except FileExistsError:
        pass

os.makedirs("dist/super",exist_ok=True)
shutil.copyfile("src/index.html","dist/index.html")
shutil.copyfile("src/about.txt","dist/about.txt")
shutil.copyfile("src/help.html","dist/help.html")

#some web hosts treat *anything* with a .py in the name as
#if it is a cgi script, even if we don't ask to execute it.
#So we rename this to .txt in the dist folder
shutil.copyfile("src/super/pyshims.py","dist/super/pyshims.txt")

for fname in [
    "src/ext/ace/ace-builds/src-min/ace.js",
    "src/ext/ace/ace-builds/src-min/ext-language_tools.js",
    "src/ext/ace/ace-builds/src-min/mode-python.js",
    "src/ext/ace/ace-builds/src-min/theme-eclipse.js",
    "src/ext/ace/ace-builds/src-min/ext-searchbox.js",
    "src/ext/ace/ace-builds/src-min/ext-settings_menu.js",
    "src/ext/ace/ace-builds/src-min/ext-keybinding_menu.js",
    "src/ext/brython/Brython-3.13.0/brython.js",
    "src/ext/brython/Brython-3.13.0/brython_stdlib.js",
    "src/ext/manifold/package/manifold.js",
    "src/ext/manifold/package/manifold.wasm",
    "src/ext/three/package/build/three.core.min.js",
    "src/ext/three/package/build/three.module.min.js",
    "src/ext/three/package/examples/jsm/controls/OrbitControls.js",
    "src/ext/split/package/dist/split-grid.mjs"
]:
    tmp = fname.split("/")
    libname = tmp[2]
    folder=f"dist/ext/{libname}"
    os.makedirs(folder,exist_ok=True)
    shutil.copyfile(fname,f"{folder}/{tmp[-1]}")

# link("../ext","dist/ext")
