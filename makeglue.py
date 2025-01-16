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


class NUMBER:
    checker="assertIsNumber"
    name="number"
class POSITIVE_NUMBER:
    checker="assertIsPositiveNumber"
    name="positive number"
class COLOR:
    checker="assertIsColor"
    name="color"
class DRAWABLE:
    checker="assertIsDrawable"
    name="drawable object"
class POLYGON2D:
    checker="assertIsPolygon2D"
    name="2D polygon"
class VEC2:
    checker="assertIsVec2"
    name="vec2"
class NONNEGATIVE_INTEGER:
    checker="assertIsNonnegativeInteger"
    name="integer >= 0"
class POSITIVE_INTEGER:
    checker="assertIsPositiveInteger"
    name="integer > 0"
class BOOLEAN:
    checker="assertIsBoolean"
    name="boolean"

def cube(xsize: POSITIVE_NUMBER,
         ysize: POSITIVE_NUMBER,
         zsize: POSITIVE_NUMBER,
         x:NUMBER=0.0,
         y:NUMBER=0.0,
         z:NUMBER=0.0,
         centered: BOOLEAN=False,
         color: COLOR=None):
    """Creates a cube
    @param xsize Size of the cube in the x direction
    @param ysize Size of the cube in the y direction
    @param zsize Size of the cube in the z direction
    @param x X coordinate of the cube
    @param y Y coordinate of the cube
    @param z Z coordinate of the cube
    @param centered True if the cube should be centered around (x,y,z); false if the minimum coordinate is at (x,y,z).
    @param color Color for the object, or None for default color.
    """
    pass

def sphere( radius: POSITIVE_NUMBER,
            x: NUMBER=0.0,
            y: NUMBER=0.0,
            z: NUMBER=0.0,
            color: COLOR=None,
            resolution: POSITIVE_INTEGER=48):
    """Creates a sphere.
    @param x Sphere center x
    @param y Sphere center y
    @param z Sphere center z
    @param radius Sphere radius
    @param resolution How finely tessellated the sphere should be
    @param color Color for the object, or None for default color.
    """
    pass

# ~ def cylinder(   x: float,
                # ~ y: float,
                # ~ z: float,
                # ~ radius: POSITIVE_NUMBER,
                # ~ height: POSITIVE_NUMBER,
                # ~ zcenter: bool=True,
                # ~ color:COLOR=None,
                # ~ resolution: POSITIVE_INTEGER=36):
    # ~ """Creates a cylinder; the cylinder's axis is parallel to the z axis.
    # ~ @param x Cylinder center x
    # ~ @param y Cylinder center y
    # ~ @param z Cylinder z. See the zcenter argument.
    # ~ @param radius Radius of the cylinder
    # ~ @param height Height of the cylinder
    # ~ @param zcenter If True, (x,y,z) is the coordinate of the cylinder's center. If false, (x,y,z) is the center of the bottom of the cylinder.
    # ~ @param resolution Number of edges around the cylinder's circumference
    # ~ """
    # ~ pass

# ~ FuncSpec(
    # ~ name= "frustum",
    # ~ doc= "Creates a frustum",
    # ~ args=[
        # ~ ArgSpec( argname= "x", argtype= [ArgType.NUMBER], doc= "Frustum center x" },
        # ~ ArgSpec( argname= "y", argtype= [ArgType.NUMBER], doc= "Frustum center y" },
        # ~ ArgSpec( argname= "z", argtype= [ArgType.NUMBER], doc= "Frustum center z. See zcenter." },
        # ~ ArgSpec( argname= "radius1", argtype= [ArgType.POSITIVE_NUMBER], doc= "Radius at frustum minimum z" },
        # ~ ArgSpec( argname= "radius2", argtype= [ArgType.POSITIVE_NUMBER], doc= "Radius at frustum maximum z" },
        # ~ ArgSpec( argname= "height", argtype= [ArgType.POSITIVE_NUMBER], doc= "Height (z direction) of frustum" },
        # ~ ArgSpec( argname= "zcenter", argtype= [ArgType.BOOLEAN], defaultValue= "False",
            # ~ doc="If true, z is the coordinate of the frustum's center. If false, z is the lowest z value of the frustum."
        # ~ },
        # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc},
        # ~ ArgSpec( argname= "resolution", argtype= [ArgType.POSITIVE_INTEGER], defaultValue="36",doc= "How many edges are around the cylinder's circumference" },
    # ~ ]
# ~ },
# ~ FuncSpec(
    # ~ name= "union",
    # ~ doc= "Compute the union of two objects (a solid that encloses those points that are in either or both objects)",
    # ~ args= [
        # ~ ArgSpec( argname= "object1", argtype= [ArgType.DRAWABLE], doc= "The first object to union" },
        # ~ ArgSpec( argname= "object2", argtype= [ArgType.DRAWABLE], doc= "The second object to union" },
        # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc2}
    # ~ ]
# ~ },
# ~ FuncSpec(
    # ~ name= "intersection",
    # ~ doc= "Compute the intersection of two objects (a solid that encloses those points that are in both objects)",
    # ~ args= [
        # ~ ArgSpec( argname= "object1", argtype= [ArgType.DRAWABLE], doc= "The first object to intersect" },
        # ~ ArgSpec( argname= "object2", argtype= [ArgType.DRAWABLE], doc= "The second object to intersect" },
        # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc2}
    # ~ ]
# ~ },

def difference(object1: DRAWABLE, object2: DRAWABLE, color: COLOR=None):
    """Compute the difference of two objects (a solid that encloses those points that are in object1 but not in object2)
        @param object1 The first object
        @param object2 The second object
        @param color Color for the object; if None, use object1 color
    """
    pass

# ~ FuncSpec(
        # ~ name= "translate",
        # ~ doc= "Move an object to another location.",
        # ~ args= [
            # ~ ArgSpec( argname= "object1", argtype= [ArgType.DRAWABLE], doc= "The object to move" },
            # ~ ArgSpec( argname= "tx", argtype= [ArgType.NUMBER], doc= "Translation x"},
            # ~ ArgSpec( argname= "ty", argtype= [ArgType.NUMBER], doc= "Translation y"},
            # ~ ArgSpec( argname= "tz", argtype= [ArgType.NUMBER], doc= "Translation z"},
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc2}
        # ~ ]
    # ~ },
    # ~ FuncSpec(
        # ~ name= "scale",
        # ~ doc= "Scale an object. Note that if the object is located away from the origin, it will move closer or further from the origin.",
        # ~ args= [
            # ~ ArgSpec( argname= "object1", argtype= [ArgType.DRAWABLE], doc= "The object to scale" },
            # ~ ArgSpec( argname= "sx", argtype= [ArgType.NUMBER], doc= "x factor; 1.0=no change"},
            # ~ ArgSpec( argname= "sy", argtype= [ArgType.NUMBER], doc= "y factor; 1.0=no change"},
            # ~ ArgSpec( argname= "sz", argtype= [ArgType.NUMBER], doc= "z factor; 1.0=no change"},
            # ~ ArgSpec( argname= "centroid", argtype= [ArgType.BOOLEAN], defaultValue= "True", doc="If true, scale around object's centroid. If false, scale relative to origin."},
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc2}
        # ~ ]
    # ~ },
    # ~ FuncSpec(
        # ~ name= "rotate",
        # ~ doc="Rotate an object by 'angle' *radians* around the given axis.",
        # ~ args= [
            # ~ ArgSpec( argname= "object1", argtype= [ArgType.DRAWABLE], doc= "The object to rotate" },
            # ~ ArgSpec( argname= "axisx", argtype= [ArgType.NUMBER], doc= "The axis of rotation (x)"},
            # ~ ArgSpec( argname= "axisy", argtype= [ArgType.NUMBER], doc= "The axis of rotation (y)"},
            # ~ ArgSpec( argname= "axisz", argtype= [ArgType.NUMBER], doc= "The axis of rotation (z)"},
            # ~ ArgSpec( argname= "angle", argtype= [ArgType.NUMBER], doc= "The angle in radians" },
            # ~ ArgSpec( argname= "centroid", argtype= [ArgType.BOOLEAN], defaultValue= "True", doc="If true, rotate around object's centroid. If false, rotate relative to origin."},
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc2}
        # ~ ],
        # ~ additionalChecks= ['if axisx*axisx + axisy*axisy + axisz*axisz < 0.01= raise Exception("Axis is nearly zero length")']
    # ~ },
    # ~ FuncSpec(
        # ~ name= "hull",
        # ~ doc="Compute the convex hull of the given objects.",
        # ~ args= [
            # ~ ArgSpec( argname= "objects", argtype= [ArgType.LIST_OF_DRAWABLE], doc= "The objects for the hull computation"},
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc}
        # ~ ]
    # ~ },
    # ~ FuncSpec(
        # ~ name= "boundingbox",
        # ~ doc= "Compute the bounding box of the given objects. Returns a cuboid (as if cube() was called).",
        # ~ args= [
            # ~ ArgSpec( argname= "objects", argtype= [ArgType.LIST_OF_DRAWABLE,ArgType.DRAWABLE], doc= "The objects for the bounding box computation"},
            # ~ ArgSpec( argname= "offsetnx", argtype= [ArgType.NUMBER], defaultValue="0", doc= "Amount to offset the negative x side of the bounding box"},
            # ~ ArgSpec( argname= "offsetpx", argtype= [ArgType.NUMBER], defaultValue="0", doc= "Amount to offset the positive x side of the bounding box"},
            # ~ ArgSpec( argname= "offsetny", argtype= [ArgType.NUMBER], defaultValue="0", doc= "Amount to offset the negative y side of the bounding box"},
            # ~ ArgSpec( argname= "offsetpy", argtype= [ArgType.NUMBER], defaultValue="0", doc= "Amount to offset the positive y side of the bounding box"},
            # ~ ArgSpec( argname= "offsetnz", argtype= [ArgType.NUMBER], defaultValue="0", doc= "Amount to offset the negative z side of the bounding box"},
            # ~ ArgSpec( argname= "offsetpz", argtype= [ArgType.NUMBER], defaultValue="0", doc= "Amount to offset the positive z side of the bounding box"},
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc}
        # ~ ]
    # ~ },
    # ~ FuncSpec(
        # ~ name= "cut",    //note= This is Manifold's splitByPlane
        # ~ doc= "Cuts the given object with a plane and discards one half. A plane is defined by the equation Ax + By + Cz + D = 0",
        # ~ args= [
            # ~ ArgSpec( argname= "object1", argtype= [ArgType.DRAWABLE], doc= "The object to cut"},
            # ~ ArgSpec( argname= "planeA", argtype= [ArgType.NUMBER], doc= "The plane normal's x coordinate"},
            # ~ ArgSpec( argname= "planeB", argtype= [ArgType.NUMBER], doc= "The plane normal's y coordinate"},
            # ~ ArgSpec( argname= "planeC", argtype= [ArgType.NUMBER], doc= "The plane normal's z coordinate"},
            # ~ ArgSpec( argname= "planeD", argtype= [ArgType.NUMBER], doc= "The D value of the plane equation"},
            # ~ ArgSpec( argname= "keepPositive", argtype= [ArgType.BOOLEAN], doc= "If True, keep the part of the object on the positive side of the plane. Otherwise, keep the part on the negative side."},
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc2}
        # ~ ]
    # ~ },
    # ~ FuncSpec(
        # ~ //FIXME= Manifold can handle a CrossSection object here too...
        # ~ name= "extrude",
        # ~ doc= "Extrude a 2D polygon (in the XY plane) in the Z direction.",
        # ~ args= [
            # ~ ArgSpec( argname= "polygon", argtype= [ArgType.POLYGON2D], doc= "The polygon to extrude, as a list of [x,y] pairs"},
            # ~ ArgSpec( argname= "height", argtype= [ArgType.POSITIVE_NUMBER], doc= "The height of the extrusion"},
            # ~ ArgSpec( argname= "divisions", argtype= [ArgType.POSITIVE_INTEGER], defaultValue= "None", doc= "Number of divisions in the extrusion"},
            # ~ ArgSpec( argname= "twist", argtype= [ArgType.NUMBER], defaultValue= "None", doc= "Amount of twist (rotation) of the top relative to the bottom in radians"},
            # ~ ArgSpec( argname= "scale", argtype= [ArgType.VEC2], defaultValue= "None", doc= "Amount to scale the top coordinates; 0 gives a cone; 1 gives the same size as the bottom"},
            # ~ ArgSpec( argname= "zcenter", argtype= [ArgType.BOOLEAN], defaultValue= "False",
                # ~ doc="If true, the extruded shape will be centered around the z axis. If false, the extruded shape will have z=0 as its minimum z value."
            # ~ },
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc}

        # ~ ]
    # ~ },
    # ~ FuncSpec(
        # ~ name= "revolve",
        # ~ doc= "Create a solid of revolution. The axis of the solid is the z axis.",
        # ~ args= [
            # ~ ArgSpec( argname= "polygon", argtype= [ArgType.POLYGON2D], doc= "The polygon to revolve, as a list of [x,y] pairs"},
            # ~ ArgSpec( argname= "angle", argtype= [ArgType.NUMBER], defaultValue= "None", doc= "Angle of revolution in radians. If omitted, use 2pi (=360 degrees)"},
            # ~ ArgSpec( argname= "color", argtype= [ArgType.COLOR], defaultValue= "None", doc= colordoc},
            # ~ ArgSpec( argname= "resolution", argtype= [ArgType.POSITIVE_INTEGER], defaultValue= "36", doc= "The number of steps for the revolution"}
        # ~ ]
    # ~ }

    # ~ //TODO: mirror, refine, refineToTolerance, slice, split
# ~ ];



def assertIsNumber(x):
    return type(x) == int or type(x) == float

def assertIsPositiveNumber(x):
    return assertIsNumber(x) and x > 0

def assertIsNonnegativeNumber(x):
    return assertIsNumber(x) and x >= 0

def assertIsByte(x):
    return assertIsNumber(x) and x >= 0 and x <= 255

def assertIsBoolean(x):
    return (x == True or x == False)

def assertIsColor(x):
    if type(x) != list and type(x) != tuple:
        return False
    if len(x) != 3 and len(x) != 4:
        return False
    return all( [ assertIsByte(q) for q in x] )

def assertIsDrawable(obj):
    try:
        tmp = obj.to_dict()
        if tmp.get("_is_drawable_") != True:
            return False
        return True
    except Exception as e:
        return False

def assertIsListOfDrawable(obj):
    if type(obj) != tuple and type(obj) != list:
        return False
    return all( [ assertIsDrawable(q) for q in obj ] )

def assertIsPolygon2D(obj):
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) < 3:
        return False
    return all( [ assertIsVec2(q) for q in obj] )

def assertIsVec2(obj):
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) != 2:
        return False
    return all( [ assertIsNumber(q) for q in obj] )


def assertIsNonnegativeInteger(obj):
    return type(obj) == int and obj >= 0

def assertIsPositiveInteger(obj):
    return type(obj) == int and obj > 0


def draw(*objs):
    #if we pass a single thing to draw(),
    #brython doesn't wrap it in a tuple as CPython does.
    if type(objs) != tuple and type(objs) != list:
        objs = [objs]
    for i in range(len(objs)):
        drawHelper(objs[i],i)

def drawHelper(obj, parameterNumber):
    if type(obj) == list or type(obj) == tuple:
        for x in obj:
            drawHelper(x,parameterNumber)
    else:
        if not assertIsDrawable(obj):
            raise Exception(f"draw(): Parameter {parameterNumber+1} is not a drawable object or contains something that is not a drawable object")
        browser.self.impl_draw(obj)

def _main():

    pyfile = "src/super/pyshims.py"
    docfile = "src/super/pyshimdoc.ts"
    tsfile = "src/worker/tsshims.ts"

    pyshimNames=[]

    with open(pyfile,"w") as fp:
        print(file=fp)
        print(file=fp)
        print("# This file is autogenerated. Do not edit.",file=fp)
        print(file=fp)
        print(file=fp)

        print("import javascript  #type: ignore",file=fp)
        print("import browser  #type: ignore", file=fp)

        #ref: Wikipedia
        print("pi = 3.141592653589793238462643383279",file=fp)

        print("_print = print",file=fp)
        print(file=fp)

        #if we send a single thing to print(),
        #brython does not wrap it in a tuple as
        #CPython does.
        print("def print(*args):",file=fp)
        print("    if type(args) != list and type(args) != tuple:",file=fp)
        print("        args=[args]",file=fp)
        print("    lst=[]",file=fp)
        print("    for a in args:",file=fp)
        print("        lst.append(str(a))",file=fp)
        print("    tmp = ' '.join(lst)",file=fp)
        print("    browser.self.impl_print(tmp)",file=fp)

        G=globals()
        for name in G:

            if name.startswith("_"):
                continue
            if not inspect.isfunction(G[name]):
                #print(name,"is not a function; skipping")
                continue
            _generatePythonShim(name,fp,pyshimNames)

    with open(docfile,"w") as fp:
        print(file=fp)
        print(file=fp)
        print("//This file is autogenerated. Do not edit.",file=fp)
        print(file=fp)
        print(file=fp)

        print("export enum ArgType { NUMBER, POSITIVE_NUMBER, BOOLEAN, COLOR, DRAWABLE, LIST_OF_DRAWABLE, POLYGON2D, VEC2, NONNEGATIVE_INTEGER, POSITIVE_INTEGER }",file=fp)

        print("export interface ArgSpec {",file=fp)
        print("     argname: string;",file=fp)
        print("     argtype: ArgType[];",file=fp)
        print("     doc: string;",file=fp)
        print("     defaultValue?: string;",file=fp)
        print("}",file=fp)
        print("export interface FuncSpec {",file=fp)
        print("    name: string,",file=fp)
        print("    args: ArgSpec[],",file=fp)
        print("    doc: string,",file=fp)
        print("    additionalChecks?: string[]",file=fp)
        print("};",file=fp)


        print("let preambleFunctions: FuncSpec[] = [",file=fp)

        for name in pyshimNames:
            _outputDoc(fp,name)

        print("] //end preambleFunctions list",file=fp)

        print("export function getPreambleFunctionInfo() {",file=fp)
        print("    return preambleFunctions;",file=fp)
        print("}",file=fp)


    with open(tsfile,"w") as fp:
        print(file=fp)
        print(file=fp)
        print("//This file is autogenerated. Do not edit.",file=fp)
        print(file=fp)
        print(file=fp)
        print('import Module, {Manifold, ManifoldToplevel, Mat4, Vec3} from "../ext/manifold/manifold.js";',file=fp)
        print('import { ManifoldMeshWrapper, MeshHandle, manifoldMeshes } from "./workertypes.js";',file=fp)
        print('let manifold: ManifoldToplevel;',file=fp)
        print(file=fp)
        print("export function setManifold(m: ManifoldToplevel){",file=fp)
        print("    manifold=m;",file=fp)
        print("}",file=fp)
        print(file=fp)
        print("type PyColor = [number,number,number,number?];",file=fp)
        print(file=fp)
        for name in pyshimNames:
            _generateTSShim(name,fp)

    return


def _outputDoc(fp,name):

    G=globals()

    sig = inspect.signature(G[name])
    src = inspect.getsource(G[name])
    #get docstring
    i1 = src.find('"""')
    if i1 == -1:
        assert 0
    else:
        i2 = src.find('"""',i1+1)
    doc = src[i1+3:i2]
    lst = doc.split("@param")

    functionDoc = lst[0].strip()

    pdocs={}
    for tmp in lst[1:]:
        tmp=tmp.strip()
        i = tmp.find(" ")
        assert i != -1
        pname = tmp[:i].strip()
        pdocs[pname] = tmp[i:].strip()

    print("    {",file=fp)
    print(f"    name: '{name}',",file=fp)
    print(f"    doc: '{functionDoc}', ",file=fp)
    print(f"    args: [",file=fp)
    for pname in sig.parameters:
        pinfo = sig.parameters[pname]
        anno = pinfo.annotation
        if pname in pdocs:
            doc = pdocs[pname]
        else:
            doc=""
            print("Warning: No documentation for parameter",pname,"of",name)
        defval = pinfo.default
        if defval == inspect.Parameter.empty:
            defval = "undefined"
        else:
            defval = f'"{defval}"'

        print(f'        {{ argname: "{pname}", argtype: [ArgType.{anno.__name__}], defaultValue: {defval}, doc: "{doc}" }},',file=fp)
    print("    ]",file=fp)
    print("    },",file=fp)



#js types for python types
jstypemap = {
    NUMBER: "number",
    POSITIVE_NUMBER: "number",
    COLOR: "PyColor",
    DRAWABLE: "MeshHandle",
    POLYGON2D: "vec2[]",
    VEC2: "Vec2",
    NONNEGATIVE_INTEGER: "number",
    POSITIVE_INTEGER: "number",
    BOOLEAN: "boolean"
}


def _generateTSShim(name,fp):
    G=globals()
    sig = inspect.signature(G[name])
    tmp=[]
    for pname in sig.parameters:
        pinfo = sig.parameters[pname]
        anno = pinfo.annotation
        if anno == inspect.Parameter.empty:
            jstype="any"
        else:
            jstype = jstypemap[anno]

        tmp.append(f"{pname} : {jstype}")

    print(f"type {name}_t = ( {','.join(tmp)} ) => any;",file=fp)
    print(f"declare global {{",file=fp)
    print(f"    interface WorkerGlobalScope {{ impl_{name} : {name}_t }}",file=fp)
    print(f"}};",file=fp)
    print(file=fp)
    print(f"self.impl_{name} = ( {','.join(tmp)} ) => {{",file=fp)
    print(tsImpl[name],file=fp)
    print(f"}}",file=fp)

def _generatePythonShim(name,fp,shims):

    #marks start of function body
    rex1 = re.compile(r"\)\s*:[ \t]*\n")

    #docstring, if there is one. We assume we always have double quotes,
    #(not apostrophes) used to delimit the string
    rex2 = re.compile(r'(?s)\s+((""".*?""")|("[^"].*?"))')


    G=globals()

    sig = inspect.signature(G[name])
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
    assert M

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
        assert name not in shims
        shims.append(name)

    else:
        #copy the function body as-is
        print("    "+src2,file=fp)

tsImpl = {

"cube": """
    let c = manifold.Manifold.cube(
        [xsize, ysize, zsize],
        centered
    );
    let c2 = c.translate([x,y,z]);
    c.delete()
    return new MeshHandle( new ManifoldMeshWrapper(c2,color) );
""",

"sphere":"""
    let s = manifold.Manifold.sphere(radius, resolution);
    let s2 = s.translate([x, y,z]);
    s.delete();
    return new MeshHandle( new ManifoldMeshWrapper(s2,color) );
""",

"difference":"""
    let o1 = manifoldMeshes[ object1.index ];
    let o2 = manifoldMeshes[ object2.index ];
    let d = manifold.Manifold.difference(o1.mesh,o2.mesh);
    if( !color )
        color = o1.color;
    return new MeshHandle( new ManifoldMeshWrapper(d,color) );
"""
} #end of tsImpl dictionary


_main()
