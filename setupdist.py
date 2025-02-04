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
shutil.copyfile("src/demo.txt","dist/demo.txt")
shutil.copyfile("src/main.css","dist/main.css")
shutil.copyfile("src/treeicons.svg","dist/treeicons.svg")

os.makedirs("dist/icons",exist_ok=True)
for icon in ["sphere","box","cylinder","union","intersection","difference"]:
    shutil.copyfile(f"src/icons/{icon}.svg",f"dist/icons/{icon}.svg")

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
    "src/ext/ace/ace-builds/src-min/ext-prompt.js",
    "src/ext/brython/Brython-3.13.0/brython.js",
    "src/ext/brython/Brython-3.13.0/brython_stdlib.js",
    "src/ext/manifold/package/manifold.js",
    "src/ext/manifold/package/manifold.wasm",
    "src/ext/three/package/build/three.core.min.js",
    "src/ext/three/package/build/three.module.min.js",
    "src/ext/three/package/examples/jsm/controls/OrbitControls.js",
    "src/ext/three/package/examples/jsm/lines/LineMaterial.js",
    "src/ext/three/package/examples/jsm/lines/LineSegmentsGeometry.js",
    "src/ext/three/package/examples/jsm/lines/LineSegments2.js",
    "src/ext/three/package/examples/jsm/lines/Line2.js",

    ( "src/ext/three/package/examples/jsm/lines/LineSegments2.js",
      "dist/ext/lines",
    ),
    # ( "src/ext/three/package/examples/jsm/lines/LineGeometry.js",
    #   "dist/ext/lines",
    # ),
    ( "src/ext/three/package/examples/jsm/lines/LineMaterial.js",
      "dist/ext/lines",
    ),
    ( "src/ext/three/package/examples/jsm/lines/LineSegmentsGeometry.js",
      "dist/ext/lines",
    ),

    # "src/ext/three/package/examples/jsm/renderers/CSS2DRenderer.js",
    # "src/ext/three/package/examples/jsm/controls/TrackballControls.js",
    "src/ext/split/package/dist/split-grid.mjs",

    "src/ext/jquery/jquery.js",
    "src/ext/jstree/jstree.min.js",
    "src/ext/jstree/mystyle.css",

    "src/ext/pythonlogo/python-logo-small.svg",
    # "src/ext/jquery/jquery-3.7.1.min.js",
    # "src/ext/jqueryui/jquery-ui.min.css",
    # "src/ext/jqueryui/jquery-ui.min.js",
    # "src/ext/jqueryui/jquery-ui.structure.min.css",
    # "src/ext/jqueryui/jquery-ui.theme.min.css",
]:
    if type(fname) == str:
        folder=f"dist/ext/{fname.split('/')[2]}"
    else:
        fname,folder = fname

    dest = f"{folder}/{fname.split("/")[-1]}"
    os.makedirs(folder,exist_ok=True)
    shutil.copyfile(fname,dest)

