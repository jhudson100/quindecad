#make the Python glue between the user's Python code and the JS implementation.
#Also make the JS implementations.

import enum
import typing
import inspect
import sys
import re
# ~ ArgType = enum.Enum("ArgType", "NUMBER POSITIVE_NUMBER BOOLEAN COLOR DRAWABLE LIST_OF_DRAWABLE POLYGON2D VEC2 NONNEGATIVE_INTEGER POSITIVE_INTEGER")

# ~ class ArgSpec:
    # ~ def __init__(self, argname: str, argtype: list[ArgType], doc: str, defaultValue: typing.Any):
        # ~ self.argname=argname
        # ~ self.argtype=argtype
        # ~ self.doc=doc
        # ~ self.defaultValue=defaultValue

# ~ class FuncSpec:
    # ~ def __init__(self,name:str, args: list[ArgSpec], doc: str, additionalChecks: list[str]):
        # ~ self.name=name
        # ~ self.args=args
        # ~ self.doc=doc
        # ~ self.additionalChecks=additionalChecks

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

#FIXME: Add x,y,z parameters to this
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
    """
    return impl_cube(xsize,ysize,zsize,x,y,z,centered,color)

def sphere( x: NUMBER,
            y: NUMBER,
            z: NUMBER,
            radius: POSITIVE_NUMBER,
            color: COLOR=None,
            resolution: POSITIVE_INTEGER=48):
    """Creates a sphere.
    @param x Sphere center x
    @param y Sphere center y
    @param z Sphere center z
    @param radius Sphere radius
    @param resolution How finely tessellated the sphere should be
    """
    return impl_sphere(x,y,z,radius,color,resolution)

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
        @param objec2 The second object
    """
    return impl_difference(object1,object2,color)


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
    for i in range(len(objs)):
        drawHelper(objs[i],i)

def drawHelper(obj, parameterNumber):
    if type(obj) == list or type(obj) == tuple:
        _drawHelper(obj,parameterNumber)
    else:
        if not assertIsDrawable(obj):
            raise Exception(f"draw(): Parameter {parameterNumber+1} is not a drawable object or contains something that is not a drawable object")
        browser.self.impl_draw(obj)

def main():

    preamblefile=sys.argv[1]

    #marks start of function body
    rex1 = re.compile(r"\)\s*:[ \t]*\n")

    #docstring, if there is one. We assume we always have double quotes,
    #(not apostrophes) used to delimit the string
    rex2 = re.compile(r'(?s)\s+((""".*?""")|("[^"].*?"))')

    with open(preamblefile,"w") as fp:
        print("import javascript",file=fp)
        print("import browser", file=fp)
        print("_print = print",file=fp)
        print(file=fp)
        print("def print(*args):",file=fp)
        print("    lst=[]",file=fp)
        print("    for a in args:",file=fp)
        print("        lst.append(str(a))",file=fp)
        print("    tmp = " ".join(lst)",file=fp)
        print("    browser.self.impl_print(tmp)",file=fp)

        G=globals()
        for name in G:
            if name.startswith("_") or name == "main":
                continue
            if not inspect.isfunction(G[name]):
                continue

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
            src = src[M.end():]

            #see if we have a docstring
            M = rex2.match(src)

            #remove the docstring if it exists
            if M:
                src = src[M.end():]


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

                print(f"        raise Exception('Parameter {pname} has wrong type (expected {expectedType})'",file=fp)


            print(src,file=fp)

    #the JS glue file
    ??


"""
    preambleFunctions.forEach( (fs: FuncSpec) => {
        let funcname = fs.name;

        //get the function's arguments
        let args = fs.args;

        let argsAsStrings: string[] = [];
        //add each argument along with its default value, if any
        args.forEach( (a: ArgSpec ) => {
            if( a.defaultValue )
                argsAsStrings.push( `${a.argname} = ${a.defaultValue}` );
            else
                argsAsStrings.push( `${a.argname}` );
        });

        preambleCodeList.push(`def ${funcname}( ${argsAsStrings.join(",")} ):`);
        // preambleCodeList.push(`    _print("@@@ in ${funcname} @@@")`);

        //generate code to verify each argument passed in at runtime is
        //the type we expect
        args.forEach( (a:ArgSpec) => {

            let checker: string     //function that will check the arg
            let expectation: string;    //message to print if expectation is not met



            if(a.defaultValue !== undefined ){
                //if default value is given then
                //allow the arg if it matches the default value
                //regardless of the declared type for the arg.
                preambleCodeList.push(`    ok = ${a.argname} == ${a.defaultValue}`);
            } else{
                preambleCodeList.push("    ok = False")
            }

            let expectations: string[] = [];

            a.argtype.forEach( (atype: ArgType ) => {

                switch( atype ){
                    case ArgType.POSITIVE_NUMBER:
                        checker="assertIsPositiveNumber";
                        expectation="a positive number";
                        break;
                    case ArgType.BOOLEAN:
                        checker="assertIsBoolean";
                        expectation="True or False";
                        break;
                    case ArgType.NUMBER:
                        checker="assertIsNumber";
                        expectation="a number";
                        break;
                    case ArgType.COLOR:
                        checker="assertIsColor";
                        expectation="a color";
                        break;
                    case ArgType.DRAWABLE:
                        checker="assertIsDrawable";
                        expectation="a drawable object"
                        break;
                    case ArgType.LIST_OF_DRAWABLE:
                        checker="assertIsListOfDrawable";
                        expectation="list of drawable objects"
                        break;
                    case ArgType.POLYGON2D:
                        checker="assertIsPolygon2D";
                        expectation="2D polygon";
                        break;
                    case ArgType.VEC2:
                        checker="assertIsVec2";
                        expectation="2D point or vector";
                        break;
                    case ArgType.NONNEGATIVE_INTEGER:
                        checker="assertIsNonnegativeInteger";
                        expectation="Nonnegative integer";
                        break;
                    case ArgType.POSITIVE_INTEGER:
                        checker="assertIsPositiveInteger";
                        expectation="Positive integer";
                        break;
                    default:
                        throw new Error("Internal error");
                        //See comment on neverCallThis above. neverCallThis(0);
                }
                expectations.push(expectation);
                // preambleCodeList.push(`    _print("@@@ check using ${checker}: ${a.argname} @@@")`);
                preambleCodeList.push(`    ok = ok or ${checker}(${a.argname})`);
            });

            // preambleCodeList.push(`    _print("@@@ checker gave us:",ok)`);
            preambleCodeList.push("    if not ok:");
            let ptmp = `"Bad value for ${a.argname}: Should be ${expectations.join(" or ")}; got "+str(type(${a.argname}))+")"`;
            preambleCodeList.push(`        raise Exception(${ptmp},${a.argname})`);

            // preambleCodeList.push(`    _print("@@@ is it None?")`);
            // preambleCodeList.push(`    _print("@@@",${a.argname})`);

            //we must use 'is' here because == will try to do an equality comparison,
            //and that will fail if arg is in fact a JS object that's being passed in.
            preambleCodeList.push(`    if ${a.argname} is None: `);
            // preambleCodeList.push(`        _print("it is None, so make it undefined")`);
            preambleCodeList.push(`        ${a.argname} = javascript.UNDEFINED`);
            // preambleCodeList.push(`    else:`);
            // preambleCodeList.push(`        _print("it is not None")`);
            // preambleCodeList.push(`    _print("@@@ done with this arg")`);
        });

        // preambleCodeList.push(`    _print("@@@ additional checks?")`);

        if(fs.additionalChecks !== undefined ){
            fs.additionalChecks.forEach( (s: string) => {
                // preambleCodeList.push(`    _print("@@@ additional checks @@@")`);
                preambleCodeList.push(`    ${s}`);
            });
        }

        //call into the JS implementation
        let tmp: string[] = [];
        args.forEach( (a:ArgSpec) => {
            tmp.push(a.argname)
        });

        // preambleCodeList.push(`    _print("@@@ call ${funcname}@@@")`);

        preambleCodeList.push(`    return browser.self.impl_${funcname}( ${tmp.join(",")})`);

        //construct a dictionary with all of the data we'll need.
        // preambleCodeList.push("    return {")
        // preambleCodeList.push(`        'type': '${funcname.toUpperCase()}',`)
        // args.forEach( (a:ArgSpec) => {
        //     preambleCodeList.push(`        '${a.argname}' : ${a.argname},`);
        // });

        //special flag so we know this is a valid thing that can be drawn
        // preambleCodeList.push("        '_is_drawable_' : True");

        // preambleCodeList.push("    }")
        preambleCodeList.push("");
    });


    preambleStr += preambleCodeList.join("\n");

    //FIXME: Can access attributes of webworker's 'self' via 'browser.self'
    //use this to improve manifold integration

    //we then have some handwritten preamble functions
    preambleStr += `

class MyException(Exception):
    def __init__(self,*args):
        lst=[__PRINT__]
        for x in args:
            lst.append(x)
        super().__init__(*lst)
        self.printables = __PRINT__

#__DRAW__.append(obj)

#def fooby(x):
#    y = browser.self.foobar(x)
#    _print("JS gave back:",y)


#ref: Wikipedia
pi = 3.141592653589793238462643383279
`;

    preambleList = preambleStr.split("\n");
    numPreambleLines = preambleList.length;

    if(verbose){
        console.log(numPreambleLines,"lines of preamble:");
        for(let i=0;i<preambleList.length;++i){
            console.log( (i+1) +": "+preambleList[i]);
        }
    }

}
"""


main()
