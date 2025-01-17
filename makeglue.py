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
    name="tuple of two numbers"
class VEC3:
    checker="assertIsVec3"
    name="tuple of three numbers"
class NONZERO_VEC3:
    checker="assertIsNonzeroVec3"
    name="tuple of three numbers with x**2 + y**2 + z**2 > 0"
class NONNEGATIVE_INTEGER:
    checker="assertIsNonnegativeInteger"
    name="integer >= 0"
class POSITIVE_INTEGER:
    checker="assertIsPositiveInteger"
    name="integer > 0"
class BOOLEAN:
    checker="assertIsBoolean"
    name="boolean"
class LIST_OF_DRAWABLE:
    checker="assertIsListOfDrawable"
    name="list of drawable objects"

def free( obj: Drawable):
    """
    Free the memory associated with the given object. Note: The object may not be used after this function has been called or an exception may occur.
    @param obj The object to free.
    """
    pass

def box( min: VEC3, max: VEC3, color: COLOR=None):
    """
    Create a box that goes from the given minimum coordinate to the given maximum coordinate
    @param min The minimum coordinate
    @param max The maximum coordinate
    @param color Color for the object, or None for default color.
    """
    pass

def cube(xsize: POSITIVE_NUMBER,
         ysize: POSITIVE_NUMBER,
         zsize: POSITIVE_NUMBER,
         x:NUMBER=0.0,
         y:NUMBER=0.0,
         z:NUMBER=0.0,
         centered: BOOLEAN=False,
         color: COLOR=None):
    """
    Creates a cuboid
    @param xsize Size of the cuboid in the x direction
    @param ysize Size of the cuboid in the y direction
    @param zsize Size of the cuboid in the z direction
    @param x X coordinate of the cuboid
    @param y Y coordinate of the cuboid
    @param z Z coordinate of the cuboid
    @param centered True if the cuboid should be centered around (x,y,z); false if the minimum coordinate is at (x,y,z).
    @param color Color for the object, or None for default color.
    """
    pass

def sphere( radius: POSITIVE_NUMBER,
            x: NUMBER=0.0,
            y: NUMBER=0.0,
            z: NUMBER=0.0,
            color: COLOR=None,
            resolution: POSITIVE_INTEGER=48):
    """
    Creates a sphere.
    @param x Sphere center x
    @param y Sphere center y
    @param z Sphere center z
    @param radius Sphere radius
    @param resolution How finely tessellated the sphere should be
    @param color Color for the object, or None for default color.
    """
    pass

def cylinder(   x: NUMBER,
                y: NUMBER,
                z: NUMBER,
                radius: POSITIVE_NUMBER,
                height: POSITIVE_NUMBER,
                zcenter: BOOLEAN=True,
                color:COLOR=None,
                resolution: POSITIVE_INTEGER=36):
    """
    Creates a cylinder; the cylinder's axis is parallel to the z axis.
    @param x Cylinder center x
    @param y Cylinder center y
    @param z Cylinder z. See the zcenter argument.
    @param radius Radius of the cylinder
    @param height Height of the cylinder
    @param zcenter If True, (x,y,z) is the coordinate of the cylinder's center. If false, (x,y,z) is the center of the bottom of the cylinder.
    @param resolution Number of edges around the cylinder's circumference
    @param color Color for the object, or None for default color.
    """
    pass


def frustum(radius1:POSITIVE_NUMBER,
            radius2:POSITIVE_NUMBER,
            height: POSITIVE_NUMBER,
            x:NUMBER=0.0, y:NUMBER=0.0, z:NUMBER=0.0,
            zcenter: BOOLEAN=True,
            color:COLOR=None,
            resolution: POSITIVE_INTEGER=36):
    """
        Creates a frustum; the frustum's axis is parallel to the z axis.
        @param x Frustum center x
        @param y Frustum center y
        @param z Frustum z. See the zcenter argument.
        @param radius1 Radius of the frustum at minimum z
        @param radius2 Radius of the frustum at maximum z
        @param height Height of the frustum
        @param zcenter If True, (x,y,z) is the coordinate of the frustum's center. If false, (x,y,z) is the center of the bottom of the frustum.
        @param color Color for the object, or None for default color.
        @param resolution Number of edges around the cylinder's circumference
    """
    pass

def union(objects: LIST_OF_DRAWABLE, color: COLOR=None):
    """
        Compute the union of several objects (a solid that encloses those points that are in any object)
        @param objects A list of the objects to join together.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

def intersection(objects: LIST_OF_DRAWABLE, color: COLOR=None):
    """
        Compute the intersection of several objects (a solid that encloses those points that are in all of the objects)
        @param objects A list of the objects to intersect.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

def difference(objects: DRAWABLE|LIST_OF_DRAWABLE, color: COLOR=None):
    """
        Compute the set difference: objects[0] - objects[1] - objects[2] - ... . The set difference a-b consists of those points that are in a but not in b.
        @param objects A list of the objects for the computation.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

def translate(objects: DRAWABLE|LIST_OF_DRAWABLE, tx:NUMBER, ty:NUMBER, tz: NUMBER, color:COLOR=None):
    """
        Move objects to another location. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.
        @param objects The objects to translate
        @param tx Change in x
        @param ty Change in y
        @param tz Change in z
        @param color Color for the resulting objects; if None, use each individual object's color.
    """
    pass


def scale(objects: DRAWABLE|LIST_OF_DRAWABLE, sx:NUMBER, sy:NUMBER, sz: NUMBER, centroid: VEC3=None, color:COLOR=None):
    """
        Scale objects.
        @param objects The objects to translate. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.
        @param sx x factor; 1.0=no change
        @param sy y factor; 1.0=no change
        @param yz z factor; 1.0=no change
        @param centroid Point to scale the objects around; if None, scale each object around its own centroid
        @param color Color for the resulting objects; if None, use each individual object's color.
    """
    pass

def rotate(objects: DRAWABLE|LIST_OF_DRAWABLE, axis: NONZERO_VEC3, angle: NUMBER, centroid: VEC3=None, color: COLOR=None):
    """
        Rotate objects by 'angle' *degrees* around the given axis. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.
        @param objects The objects to translate
        @param axis The axis of rotation; must not be zero length
        @param angle The angle of rotation in degrees
        @param centroid The point around which to rotate; if None, each object is rotated around its own centeroid
        @param color Color for the resulting objects; if None, use each individual object's color.
    """
    pass

def hull(objects: DRAWABLE|LIST_OF_DRAWABLE, color: COLOR=None):
    """
        Compute the convex hull of the given objects.
        @param objects The objects for the hull computation.
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

def boundingbox(objects: DRAWABLE|LIST_OF_DRAWABLE):
    """
        Compute the bounding box of the given objects. Returns a list of two tuples. The first tuple has the minimum x,y,z; the second has the maximum x,y,z.
        @param objects The objects for the computation.
    """
    pass

def cut(object: DRAWABLE, planeNormal: VEC3, planeD: NUMBER, keepPositive: BOOLEAN, color:COLOR=None):
    """
        Cuts the given object with a plane and discards one half. A plane is defined by the equation Ax + By + Cz + D = 0 where the plane normal is (A,B,C) and D depends on the plane's distance from the origin.
        @param object The object to cut
        @param planeNormal The normal to the plane
        @param planeD Fourth component of plane equation
        @param keepPositive If True, keep the part of the object on the side that planeNormal points to; if False, keep the part of the object on the other side of the plane
        @param color Color for the object; if None, use the color of the first object in the list
    """
    pass

# FIXME: Manifold can handle a CrossSection object here too...
def extrude(polygon: POLYGON2D, height: POSITIVE_NUMBER, divisions: POSITIVE_INTEGER=None, twist: NUMBER=None, scale: VEC2=None, zcenter: BOOLEAN=False, color: COLOR=None):
    """
        Extrude a 2D polygon (polygon which lies in the XY plane). The extrusion is in the Z direction.
        @param polygon The polygon to extrude, as a list of [x,y] tuples
        @param height The height of the extrusion
        @param divisions = Number of divisions in the extrusion
        @param twist Amount of twist (rotation) of the top relative to the bottom in degrees
        @param scale Amount to scale the top coordinates; (0,0) gives a cone; (1,1) gives the same size as the bottom.
        @param zcenter If true, the extruded shape will be centered around the z axis. If false, the extruded shape will have z=0 as its minimum z value.
        @param color Color for the object; if None, use default color
    """
    pass

def revolve(polygon: POLYGON2D, angle: NUMBER=None, color: COLOR=None, resolution: POSITIVE_INTEGER=36):
    """
        Create a solid of revolution. The axis of the solid is the z axis.
        @param polygon The polygon to revolve, as a list of (x,y) pairs
        @param angle Angle of revolution in degrees. If None, use 360 degrees
        @param color Color for the object; if None, use default color
        @param resolution The number of steps for the revolution
    """
    pass

#TODO: mirror, refine, refineToTolerance, slice, split



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
    if len(obj) == 0:
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

def assertIsVec3(obj):
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) != 3:
        return False
    return all( [ assertIsNumber(q) for q in obj] )


def assertIsNonzeroVec3(obj):
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) != 3:
        return False
    if not all( [ assertIsNumber(q) for q in obj] ):
        return False
    if obj[0]*obj[0] + obj[1]*obj[1] + obj[2]*obj[2] < 0.001:
        return False
    return True


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

        print(pypreamble, file=fp)

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
        print(tspreamble,file=fp)
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
    if name not in tsImpl:
        print("No TypeScript implementation for",name)
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
    if( objects.length === 1 )
        return objects[0];
    let ob = manifold.Manifold.difference( objects[0].mesh, objects[1].mesh );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.difference( ob, objects[i].mesh );
        ob.delete();
        ob=ob2;
    }
    let color = (color ?? objects[0].color);
    return new ManifoldMeshWrapper(ob,color);
""",

"union": """
    if( objects.length === 1 )
        return objects[0];
    let ob = manifold.Manifold.union( objects[0].mesh, objects[1].mesh );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.union( ob, objects[i].mesh );
        ob.delete();
        ob=ob2;
    }
    let color = (color ?? objects[0].color);
    return new ManifoldMeshWrapper(ob,color);
""",

"intersection": """
    if( objects.length === 1 )
        return objects[0];
    let ob = manifold.Manifold.intersection( objects[0].mesh, objects[1].mesh );
    for(let i=2;i<objects.length;++i){
        let ob2 = manifold.Manifold.intersection( ob, objects[i].mesh );
        ob.delete();
        ob=ob2;
    }
    let color = (color ?? objects[0].color);
    return new ManifoldMeshWrapper(ob,color);
""",

"cylinder": """
    let c = manifold.Manifold.cylinder(height,
        radius, radius, resolution,
        zcenter
    );
    let c2 = c.translate([x, y, z]);
    c.delete();
    return new ManifoldMeshWrapper(c2,color);
""",

"frustum": """
    let c = manifold.Manifold.cylinder(height,
        radius1, radius2, resolution,
        zcenter
    );
    let c2 = c.translate([x, y, z]);
    c.delete();
    return new ManifoldMeshWrapper(c2,color);
""",

"translate":"""
    let objs: ManifoldMeshWrapper[];
    if( objects.length === undefined ){
        //it's a single object
        objs = [ objects as ManifoldMeshWrapper ];
    } else {
        //it's a list
        objs = objects as ManifoldMeshWrapper[];
    }

    let output: ManifoldMeshWrapper[] = [];
    for(let i=0;i<objs.length;++i){
        let ob = objs[i].mesh.translate( tx,ty,tz );
        output.push(new ManifoldMeshWrapper( ob, color ?? objs[i].color ) );
    }

    if( objects.length === undefined ){
        //single object in; single object out
        return output[0];
    } else {
        //list in; list out
        return output;
    }
}

""",


"scale":"""
    let objs: ManifoldMeshWrapper[];
    if( objects.length === undefined ){
        //it's a single object
        objs = [ objects as ManifoldMeshWrapper ];
    } else {
        //it's a list
        objs = objects as ManifoldMeshWrapper[];
    }

    let output: ManifoldMeshWrapper[] = [];
    for(let i=0;i<objs.length;++i){
        output.push( transformAroundCentroid( centroid, color, objs[i],
            (m: Manifold) => { return m.scale(sx,sy,sz); }
        ));
    }

    if( objects.length === undefined ){
        //single object in; single object out
        return output[0];
    } else {
        //list in; list out
        return output;
    }
}
""",

"rotate" : """
    let objs: ManifoldMeshWrapper[];
    if( objects.length === undefined ){
        //it's a single object
        objs = [ objects as ManifoldMeshWrapper ];
    } else {
        //it's a list
        objs = objects as ManifoldMeshWrapper[];
    }


    let output: ManifoldMeshWrapper[] = [];

    let x = axis[0];
    let y = axis[1];
    let z = axis[2];
    let len = Math.sqrt(x*x+y*y+z*z);
    //Python code already verified that length is not zero
    x /= len;
    y /= len;
    z /= len;

    let rotV: Vec3;
    if( x === 1.0 && y === 0.0 && z === 0.0 ){
        rotV = [angle,0,0];
    } else if( x === -1.0 && y === 0.0 && z === 0.0 ){
        rotV = [-angle,0,0];
    } else if( x ===  0.0 && y === 1.0 && z === 0.0 ){
        rotV = [0,angle,0];
    } else if( x ===  0.0 && y === -1.0 && z === 0.0 ){
        rotV = [0,-angle,0];
    } else if( x ===  0.0 && y === 0.0 && z === 1.0 ){
        rotV = [0,0,angle];
    } else if( x ===  0.0 && y === 0.0 && z === -1.0 ){
        rotV = [0,0,-angle];
    } else {
        //need to use slow path
    }

    if( rotV !== undefined ){
        for(let i=0;i<objs.length;++i){
            output.push( transformAroundCentroid( centroid, color, objs[i],
                (m: Manifold) => { return m.rotate(rotV); }
            ));
        }
    } else {
        let M = computeRotationMatrix(x,y,z,angle);
        for(let i=0;i<objs.length;++i){
            output.push( transformAroundCentroid( centroid, color, objs[i],
                (m: Manifold) => { return m.transform(M); }
            ));
        }
    }

    if( objects.length === undefined ){
        //single object in; single object out
        return output[0];
    } else {
        //list in; list out
        return output;
    }
}
""",

"hull": """
    let ob: Manifold;
    let needFree=false;

    if( objects.length === undefined ){
        //one object
        ob = objects;
    } else if( objects.length === 1 ){
        ob = objects[0];
    } else {
        //Python code ensured length of list > 0
        let ob = manifold.Manifold.union( objects[0].mesh, objects[1].mesh );
        for(let i=2;i<objects.length;++i){
            let ob2 = manifold.Manifold.union( ob, objects[i].mesh );
            ob.delete();
            ob=ob2;
        }
        needFree=true;
    }

    let o2 = manifold.Manifold.hull(ob);
    if(needFree)
        ob.delete()

    return new ManifoldMeshWrapper( o2, color ?? ob.color );
""",

"cut": """
    let results = object.mesh.splitByPlane( planeNormal, planeD);
    let ki = ( keepPositive ? 0 : 1 );
    results[1-ki].delete();
    return new ManifoldMeshWrapper( results[ki], spec.color ?? object.color );
"""

"extrude": """
    let o1 = manifold.Manifold.extrude(
            polygon,
            height ?? 1,
            divisions ?? 1,
            twist ?? 0,
            scale ?? [1,1],
            zcenter
    );
    return new ManifoldMeshWrapper( o1, color );
""",

"revolve": """
    let o1 = manifold.Manifold.revolve(
            polygon,
            resolution ?? 36,
            angle ?? 360
    );
    return new ManifoldMeshWrapper( o1, color );

"""


} #end of tsImpl dictionary


tspreamble = """
import Module, {Manifold, ManifoldToplevel, Mat4, Vec3} from "../ext/manifold/manifold.js";
import { ManifoldMeshWrapper, MeshHandle, manifoldMeshes } from "./workertypes.js";
let manifold: ManifoldToplevel;

export function setManifold(m: ManifoldToplevel){
    manifold=m;
}
type PyColor = [number,number,number,number?];

function transformAroundCentroid(centroid: Vec3|undefined, color: Color|undefined, obj: ManifoldMeshWrapper, callback: TransformFunction)
{
    let cx: number;
    let cy: number;
    let cz: number;
    if( !centroid ){
        //transform object around its own centroid
        let bbox = obj.mesh.boundingBox();
        let cx = 0.5*( bbox.min[0] + bbox.max[0] );
        let cy = 0.5*( bbox.min[1] + bbox.max[1] );
        let cz = 0.5*( bbox.min[2] + bbox.max[2] );
    } else {
        cx = centroid[0];
        cy = centroid[1];
        cz = centroid[2];
    }

    if( cx === 0.0 && cy === 0.0 && cz === 0.0 ){
        //fast path
        let ob = callback( objs[i].mesh );
        return new ManifoldMeshWrapper( ob, color ?? obj.color ) );
    } else {
        let o2 = obj.mesh.translate([-cx,-cy,-cz]);
        let o3 = callback( o2.mesh );
        o2.delete();
        let o4 = o3.translate([cx,cy,cz]);
        o3.delete();
        return new ManifoldMeshWrapper(o4, color ?? obj.color ) );
    }
}


function computeRotationMatrix(x,y,z,angle){
    angle = angle / 180 * Math.PI;
    let c = Math.cos(angle);
    let c1 = 1-c;
    let s = Math.sin(angle);
    //this is in COLUMN major order!
    //ref: https://en.wikipedia.org/wiki/Rotation_matrix
    //ref: https://ai.stackexchange.com/questions/14041/how-can-i-derive-the-rotation-matrix-from-the-axis-angle-rotation-vector
    let M: Mat4 = [
        x*x*c1+c,
        x*y*c1+z*s,
        x*z*c1-y*s,
        0,

        y*x*c1-z*s,
        y*y*c1+c,
        y*z*c1+x*s,
        0,

        x*z*c1+y*s,
        y*z*c1-x*s,
        z*z*c1+c,
        0,

        0,0,0,1
    ]
    return M;
}

"""


pypreamble = """
import javascript  #type: ignore
import browser  #type: ignore

#ref: Wikipedia
pi = 3.141592653589793238462643383279

_print = print

#if we send a single thing to print(),
#brython does not wrap it in a tuple as
#CPython does.
def print(*args):
    if type(args) != list and type(args) != tuple:
        args=[args]
    lst=[]
    for a in args:
        lst.append(str(a))
    tmp = ' '.join(lst)
    browser.self.impl_print(tmp)

def degrees(radians):
    return radians / 3.141592653589793238462643383279 * 180

def radians(degrees):
    return degrees/180 * 3.141592653589793238462643383279

"""

_main()
