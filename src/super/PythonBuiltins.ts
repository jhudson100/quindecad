
let verbose=false;

//FIXME: Should make deep copy for list-of-drawable so we avoid object sharing/aliasing


export let preambleStr: string = "";
export let numPreambleLines: number = 0;
export let preambleList : string[] = [];

//We have several functions we construct in the Python code
//that will be available to the user's code.
//This is used to describe the type of each argument.
export enum ArgType { NUMBER, POSITIVE_NUMBER, BOOLEAN, COLOR, DRAWABLE, LIST_OF_DRAWABLE, POLYGON2D,
        VEC2, NONNEGATIVE_INTEGER, POSITIVE_INTEGER }

//Description of one argument
export interface ArgSpec {
    argname: string;
    argtype: ArgType[];
    doc: string;
    defaultValue?: string;  //Python code for default value
}

export interface FuncSpec {
    name: string,
    args: ArgSpec[],
    doc: string,
    additionalChecks?: string[]
};

const colordoc = "Color of the object, or None for default";
const colordoc2 = colordoc + ". If not specified, use the color of object1."

//all the geometry functions do the same basic thing,
//so we generate the python code for them programmatically
let preambleFunctions: FuncSpec[] = [
    {
        name: "cube",
        doc: "Creates a cube.",
        args: [
            { argname: "xsize", argtype: [ArgType.POSITIVE_NUMBER], doc:"size of the cube in the x direction" },
            { argname: "ysize", argtype: [ArgType.POSITIVE_NUMBER], doc:"size of the cube in the y direction"  },
            { argname: "zsize", argtype: [ArgType.POSITIVE_NUMBER], doc:"size of the cube in the z direction"  },
            { argname: "centered", argtype: [ArgType.BOOLEAN], defaultValue: "False",
                doc:"True if the cube should be centered around (x,y,z); False if the minimum coordinate should be (x,y,z)"
             },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc }
        ],
    },
    {
        name: "sphere",
        doc: "Creates a sphere",
        args: [
            { argname: "x", argtype: [ArgType.NUMBER], doc: "Sphere center x" },
            { argname: "y", argtype: [ArgType.NUMBER], doc: "Sphere center y" },
            { argname: "z", argtype: [ArgType.NUMBER], doc: "Sphere center z" },
            { argname: "radius", argtype: [ArgType.POSITIVE_NUMBER], doc: "Sphere radius" },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc},
            { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "48",
                doc: "How finely tessellated the sphere should be"
            },
    ]
    },

/*
    {
        name: "cylinder",
        doc: "Creates a cylinder",
        args: [
            { argname: "x", argtype: [ArgType.NUMBER], doc:"Cylinder center x"},
            { argname: "y", argtype: [ArgType.NUMBER], doc:"Cylinder center y" },
            { argname: "z", argtype: [ArgType.NUMBER], doc:"Cylinder z: See zcenter" },
            { argname: "radius", argtype: [ArgType.POSITIVE_NUMBER], doc:"Radius of the cylinder" },
            { argname: "height", argtype: [ArgType.POSITIVE_NUMBER], doc:"Height (z direction) of the cylinder" },
            { argname: "zcenter", argtype: [ArgType.BOOLEAN], defaultValue: "True",
                    doc:"If true, z is the coordinate of the cylinder's center. If false, z is the lowest z value of the cylinder."
            },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc},
            { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "36",
                doc: "Number of edges are around the cylinder's circumference" },
        ]
    },
    {
        name: "frustum",
        doc: "Creates a frustum",
        args:[
            { argname: "x", argtype: [ArgType.NUMBER], doc: "Frustum center x" },
            { argname: "y", argtype: [ArgType.NUMBER], doc: "Frustum center y" },
            { argname: "z", argtype: [ArgType.NUMBER], doc: "Frustum center z. See zcenter." },
            { argname: "radius1", argtype: [ArgType.POSITIVE_NUMBER], doc: "Radius at frustum minimum z" },
            { argname: "radius2", argtype: [ArgType.POSITIVE_NUMBER], doc: "Radius at frustum maximum z" },
            { argname: "height", argtype: [ArgType.POSITIVE_NUMBER], doc: "Height (z direction) of frustum" },
            { argname: "zcenter", argtype: [ArgType.BOOLEAN], defaultValue: "False",
                doc:"If true, z is the coordinate of the frustum's center. If false, z is the lowest z value of the frustum."
            },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc},
            { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue:"36",doc: "How many edges are around the cylinder's circumference" },
        ]
    },
    {
        name: "union",
        doc: "Compute the union of two objects (a solid that encloses those points that are in either or both objects)",
        args: [
            { argname: "object1", argtype: [ArgType.DRAWABLE], doc: "The first object to union" },
            { argname: "object2", argtype: [ArgType.DRAWABLE], doc: "The second object to union" },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc2}
        ]
    },
    {
        name: "intersection",
        doc: "Compute the intersection of two objects (a solid that encloses those points that are in both objects)",
        args: [
            { argname: "object1", argtype: [ArgType.DRAWABLE], doc: "The first object to intersect" },
            { argname: "object2", argtype: [ArgType.DRAWABLE], doc: "The second object to intersect" },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc2}
        ]
    },
*/
    {
        name: "difference",
        doc: "Compute the difference of two objects (a solid that encloses those points that are in object1 but not in object2)",
        args: [
            { argname: "object1", argtype: [ArgType.DRAWABLE], doc: "The first object" },
            { argname: "object2", argtype: [ArgType.DRAWABLE], doc: "The second object" },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc2 }
        ]
    },
/*
    {
        name: "translate",
        doc: "Move an object to another location.",
        args: [
            { argname: "object1", argtype: [ArgType.DRAWABLE], doc: "The object to move" },
            { argname: "tx", argtype: [ArgType.NUMBER], doc: "Translation x"},
            { argname: "ty", argtype: [ArgType.NUMBER], doc: "Translation y"},
            { argname: "tz", argtype: [ArgType.NUMBER], doc: "Translation z"},
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc2}
        ]
    },
    {
        name: "scale",
        doc: "Scale an object. Note that if the object is located away from the origin, it will move closer or further from the origin.",
        args: [
            { argname: "object1", argtype: [ArgType.DRAWABLE], doc: "The object to scale" },
            { argname: "sx", argtype: [ArgType.NUMBER], doc: "x factor; 1.0=no change"},
            { argname: "sy", argtype: [ArgType.NUMBER], doc: "y factor; 1.0=no change"},
            { argname: "sz", argtype: [ArgType.NUMBER], doc: "z factor; 1.0=no change"},
            { argname: "centroid", argtype: [ArgType.BOOLEAN], defaultValue: "True", doc:"If true, scale around object's centroid. If false, scale relative to origin."},
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc2}
        ]
    },
    {
        name: "rotate",
        doc:"Rotate an object by 'angle' *radians* around the given axis.",
        args: [
            { argname: "object1", argtype: [ArgType.DRAWABLE], doc: "The object to rotate" },
            { argname: "axisx", argtype: [ArgType.NUMBER], doc: "The axis of rotation (x)"},
            { argname: "axisy", argtype: [ArgType.NUMBER], doc: "The axis of rotation (y)"},
            { argname: "axisz", argtype: [ArgType.NUMBER], doc: "The axis of rotation (z)"},
            { argname: "angle", argtype: [ArgType.NUMBER], doc: "The angle in radians" },
            { argname: "centroid", argtype: [ArgType.BOOLEAN], defaultValue: "True", doc:"If true, rotate around object's centroid. If false, rotate relative to origin."},
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc2}
        ],
        additionalChecks: ['if axisx*axisx + axisy*axisy + axisz*axisz < 0.01: raise Exception("Axis is nearly zero length")']
    },
    {
        name: "hull",
        doc:"Compute the convex hull of the given objects.",
        args: [
            { argname: "objects", argtype: [ArgType.LIST_OF_DRAWABLE], doc: "The objects for the hull computation"},
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc}
        ]
    },
    {
        name: "boundingbox",
        doc: "Compute the bounding box of the given objects. Returns a cuboid (as if cube() was called).",
        args: [
            { argname: "objects", argtype: [ArgType.LIST_OF_DRAWABLE,ArgType.DRAWABLE], doc: "The objects for the bounding box computation"},
            { argname: "offsetnx", argtype: [ArgType.NUMBER], defaultValue:"0", doc: "Amount to offset the negative x side of the bounding box"},
            { argname: "offsetpx", argtype: [ArgType.NUMBER], defaultValue:"0", doc: "Amount to offset the positive x side of the bounding box"},
            { argname: "offsetny", argtype: [ArgType.NUMBER], defaultValue:"0", doc: "Amount to offset the negative y side of the bounding box"},
            { argname: "offsetpy", argtype: [ArgType.NUMBER], defaultValue:"0", doc: "Amount to offset the positive y side of the bounding box"},
            { argname: "offsetnz", argtype: [ArgType.NUMBER], defaultValue:"0", doc: "Amount to offset the negative z side of the bounding box"},
            { argname: "offsetpz", argtype: [ArgType.NUMBER], defaultValue:"0", doc: "Amount to offset the positive z side of the bounding box"},
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc}
        ]
    },
    {
        name: "cut",    //note: This is Manifold's splitByPlane
        doc: "Cuts the given object with a plane and discards one half. A plane is defined by the equation Ax + By + Cz + D = 0",
        args: [
            { argname: "object1", argtype: [ArgType.DRAWABLE], doc: "The object to cut"},
            { argname: "planeA", argtype: [ArgType.NUMBER], doc: "The plane normal's x coordinate"},
            { argname: "planeB", argtype: [ArgType.NUMBER], doc: "The plane normal's y coordinate"},
            { argname: "planeC", argtype: [ArgType.NUMBER], doc: "The plane normal's z coordinate"},
            { argname: "planeD", argtype: [ArgType.NUMBER], doc: "The D value of the plane equation"},
            { argname: "keepPositive", argtype: [ArgType.BOOLEAN], doc: "If True, keep the part of the object on the positive side of the plane. Otherwise, keep the part on the negative side."},
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc2}
        ]
    },
    {
        //FIXME: Manifold can handle a CrossSection object here too...
        name: "extrude",
        doc: "Extrude a 2D polygon (in the XY plane) in the Z direction.",
        args: [
            { argname: "polygon", argtype: [ArgType.POLYGON2D], doc: "The polygon to extrude, as a list of [x,y] pairs"},
            { argname: "height", argtype: [ArgType.POSITIVE_NUMBER], doc: "The height of the extrusion"},
            { argname: "divisions", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "None", doc: "Number of divisions in the extrusion"},
            { argname: "twist", argtype: [ArgType.NUMBER], defaultValue: "None", doc: "Amount of twist (rotation) of the top relative to the bottom in radians"},
            { argname: "scale", argtype: [ArgType.VEC2], defaultValue: "None", doc: "Amount to scale the top coordinates; 0 gives a cone; 1 gives the same size as the bottom"},
            { argname: "zcenter", argtype: [ArgType.BOOLEAN], defaultValue: "False",
                doc:"If true, the extruded shape will be centered around the z axis. If false, the extruded shape will have z=0 as its minimum z value."
            },
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc}

        ]
    },
    {
        name: "revolve",
        doc: "Create a solid of revolution. The axis of the solid is the z axis.",
        args: [
            { argname: "polygon", argtype: [ArgType.POLYGON2D], doc: "The polygon to revolve, as a list of [x,y] pairs"},
            { argname: "angle", argtype: [ArgType.NUMBER], defaultValue: "None", doc: "Angle of revolution in radians. If omitted, use 2pi (=360 degrees)"},
            { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: colordoc},
            { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "36", doc: "The number of steps for the revolution"}
        ]
    }
*/

    //TODO: mirror, refine, refineToTolerance, slice, split
];


//FIXME: This would be nice for detecting switch's that don't
//evalue all enum cases, but it doesn't work in testing.
//Need further investigation.
// //ref: https://www.meticulous.ai/blog/safer-exhaustive-switch-statements-in-typescript
// function neverCallThis(x: never) : never {
//     throw new Error("Internal error");
// }

export function getPreambleFunctionInfo() {
    return preambleFunctions;
}

export function initialize(){

    if( numPreambleLines > 0 )
        return;

    //construct preamble in tmplist
    let preambleCodeList = [
        "import javascript",
        "import browser",
        "_print = print",

    ];

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

def print(*args):
    lst=[]
    for a in args:
        lst.append(str(a))
    tmp = " ".join(lst)
    browser.self.impl_print(tmp)

#__DRAW__=[]

def draw(*objs):
    _drawHelper(objs,[])

def _drawHelper(objs,nested):
    #objs = list of ( Drawable | list[Drawable] )
    #nested = list of ints: For error reporting

    for idx in range(len(objs)):

        obj = objs[idx]

        if type(obj) == list or type(obj) == tuple:
            _drawHelper(obj,nested=nested+[idx])
            continue

        if not assertIsDrawable(obj):
            if nested == None or len(nested) == 0:
                raise Exception(f"draw(): Parameter {idx+1}: This is not a drawable object (it is of type {type(obj)} and has value {obj})")
            else:
                raise Exception(f"draw(): Parameter {nested[0]+1}: This collection contains something that is not a drawable object at index {idx+1}")

        for k in obj:
            if obj[k] == None:
                obj[k] = javascript.UNDEFINED

        browser.self.impl_draw(obj)
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
