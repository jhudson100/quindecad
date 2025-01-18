

//This file is autogenerated. Do not edit.




export enum ArgType {
    BOOLEAN,
    COLOR,
    LIST_OF_MESH_HANDLE,
    MESH_HANDLE,
    NONNEGATIVE_INTEGER,
    NONZERO_VEC3,
    NUMBER,
    POLYGON2D,
    POSITIVE_INTEGER,
    POSITIVE_NUMBER,
    VEC2,
    VEC3,
}

export interface ArgSpec {
     argname: string;
     argtype: ArgType[];
     doc: string;
     defaultValue?: string;
}
export interface FuncSpec {
    name: string,
    args: ArgSpec[],
    doc: string,
    additionalChecks?: string[]
};

export function getPreambleFunctionInfo() {
    return preambleFunctions;
}

let preambleFunctions: FuncSpec[] = [
    {
    name: 'boundingbox',
    doc: 'Compute the bounding box of the given objects. Returns a list of two tuples. The first tuple has the minimum x,y,z; the second has the maximum x,y,z.', 
    args: [
        { argname: "objects", argtype: [ArgType.MESH_HANDLE,ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "The objects for the computation." },
    ]
    },
    {
    name: 'box',
    doc: 'Create a box that goes from the given minimum coordinate to the given maximum coordinate', 
    args: [
        { argname: "min", argtype: [ArgType.VEC3], defaultValue: undefined, doc: "The minimum coordinate" },
        { argname: "max", argtype: [ArgType.VEC3], defaultValue: undefined, doc: "The maximum coordinate" },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object, or None for default color." },
    ]
    },
    {
    name: 'cube',
    doc: 'Creates a cuboid', 
    args: [
        { argname: "xsize", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Size of the cuboid in the x direction" },
        { argname: "ysize", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Size of the cuboid in the y direction" },
        { argname: "zsize", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Size of the cuboid in the z direction" },
        { argname: "x", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "X coordinate of the cuboid" },
        { argname: "y", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Y coordinate of the cuboid" },
        { argname: "z", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Z coordinate of the cuboid" },
        { argname: "centered", argtype: [ArgType.BOOLEAN], defaultValue: "False", doc: "True if the cuboid should be centered around (x,y,z); false if the minimum coordinate is at (x,y,z)." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object, or None for default color." },
    ]
    },
    {
    name: 'cut',
    doc: 'Cuts the given object with a plane and discards one half. A plane is defined by the equation Ax + By + Cz + D = 0 where the plane normal is (A,B,C) and D depends on the plane\'s distance from the origin.', 
    args: [
        { argname: "object", argtype: [ArgType.MESH_HANDLE], defaultValue: undefined, doc: "The object to cut" },
        { argname: "planeNormal", argtype: [ArgType.VEC3], defaultValue: undefined, doc: "The normal to the plane" },
        { argname: "planeD", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "Fourth component of plane equation" },
        { argname: "keepPositive", argtype: [ArgType.BOOLEAN], defaultValue: undefined, doc: "If True, keep the part of the object on the side that planeNormal points to; if False, keep the part of the object on the other side of the plane" },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object; if None, use the color of the first object in the list" },
    ]
    },
    {
    name: 'cylinder',
    doc: 'Creates a cylinder; the cylinder\'s axis is parallel to the z axis.', 
    args: [
        { argname: "x", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "Cylinder center x" },
        { argname: "y", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "Cylinder center y" },
        { argname: "z", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "Cylinder z. See the zcenter argument." },
        { argname: "radius", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Radius of the cylinder" },
        { argname: "height", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Height of the cylinder" },
        { argname: "zcenter", argtype: [ArgType.BOOLEAN], defaultValue: "True", doc: "If True, (x,y,z) is the coordinate of the cylinder's center. If false, (x,y,z) is the center of the bottom of the cylinder." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object, or None for default color." },
        { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "36", doc: "Number of edges around the cylinder's circumference" },
    ]
    },
    {
    name: 'difference',
    doc: 'Compute the set difference: objects[0] - objects[1] - objects[2] - ... . The set difference a-b consists of those points that are in a but not in b.', 
    args: [
        { argname: "objects", argtype: [ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "A list of the objects for the computation." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object; if None, use the color of the first object in the list" },
    ]
    },
    {
    name: 'draw',
    doc: 'Draw the given objects.', 
    args: [
        { argname: "objs", argtype: [ArgType.MESH_HANDLE,ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "An object or a list. Lists will be recursively examined for objects to draw." },
    ]
    },
    {
    name: 'extrude',
    doc: 'Extrude a 2D polygon (polygon which lies in the XY plane). The extrusion is in the Z direction. Note that the vertices MUST be specified in counterclockwise order.', 
    args: [
        { argname: "polygon", argtype: [ArgType.POLYGON2D], defaultValue: undefined, doc: "The polygon to extrude, as a list of [x,y] tuples" },
        { argname: "height", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "The height of the extrusion" },
        { argname: "divisions", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "None", doc: "= Number of divisions in the extrusion" },
        { argname: "twist", argtype: [ArgType.NUMBER], defaultValue: "None", doc: "Amount of twist (rotation) of the top relative to the bottom in degrees" },
        { argname: "scale", argtype: [ArgType.VEC2], defaultValue: "None", doc: "Amount to scale the top coordinates; (0,0) gives a cone; (1,1) gives the same size as the bottom." },
        { argname: "zcenter", argtype: [ArgType.BOOLEAN], defaultValue: "False", doc: "If true, the extruded shape will be centered around the z axis. If false, the extruded shape will have z=0 as its minimum z value." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object; if None, use default color" },
    ]
    },
    {
    name: 'free',
    doc: 'Free the memory associated with the given object. Note: The object may not be used after this function has been called or an exception may occur.', 
    args: [
        { argname: "obj", argtype: [ArgType.MESH_HANDLE], defaultValue: undefined, doc: "The object to free." },
    ]
    },
    {
    name: 'frustum',
    doc: 'Creates a frustum; the frustum\'s axis is parallel to the z axis.', 
    args: [
        { argname: "radius1", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Radius of the frustum at minimum z" },
        { argname: "radius2", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Radius of the frustum at maximum z" },
        { argname: "height", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Height of the frustum" },
        { argname: "x", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Frustum center x" },
        { argname: "y", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Frustum center y" },
        { argname: "z", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Frustum z. See the zcenter argument." },
        { argname: "zcenter", argtype: [ArgType.BOOLEAN], defaultValue: "True", doc: "If True, (x,y,z) is the coordinate of the frustum's center. If false, (x,y,z) is the center of the bottom of the frustum." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object, or None for default color." },
        { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "36", doc: "Number of edges around the cylinder's circumference" },
    ]
    },
    {
    name: 'hull',
    doc: 'Compute the convex hull of the union of the given objects.', 
    args: [
        { argname: "objects", argtype: [ArgType.MESH_HANDLE,ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "The objects for the hull computation." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object; if None, use the color of the first object in the list" },
    ]
    },
    {
    name: 'intersection',
    doc: 'Compute the intersection of several objects (a solid that encloses those points that are in all of the objects)', 
    args: [
        { argname: "objects", argtype: [ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "A list of the objects to intersect." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object; if None, use the color of the first object in the list" },
    ]
    },
    {
    name: 'revolve',
    doc: 'Create a solid of revolution. The axis of the solid is the z axis.', 
    args: [
        { argname: "polygon", argtype: [ArgType.POLYGON2D], defaultValue: undefined, doc: "The polygon to revolve, as a list of (x,y) pairs. These MUST be specified in counterclockwise order!" },
        { argname: "angle", argtype: [ArgType.NUMBER], defaultValue: "None", doc: "Angle of revolution in degrees. If None, use 360 degrees" },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object; if None, use default color" },
        { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "36", doc: "The number of steps for the revolution" },
    ]
    },
    {
    name: 'rotate',
    doc: 'Rotate objects by \'angle\' *degrees* around the given axis. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.', 
    args: [
        { argname: "objects", argtype: [ArgType.MESH_HANDLE,ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "The objects to translate" },
        { argname: "axis", argtype: [ArgType.NONZERO_VEC3], defaultValue: undefined, doc: "The axis of rotation; must not be zero length" },
        { argname: "angle", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "The angle of rotation in degrees" },
        { argname: "centroid", argtype: [ArgType.VEC3], defaultValue: "None", doc: "The point around which to rotate; if None, each object is rotated around its own centeroid" },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the resulting objects; if None, use each individual object's color." },
    ]
    },
    {
    name: 'scale',
    doc: 'Scale objects.', 
    args: [
        { argname: "objects", argtype: [ArgType.MESH_HANDLE,ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "The objects to translate. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list." },
        { argname: "sx", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "x factor; 1.0=no change" },
        { argname: "sy", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "y factor; 1.0=no change" },
        { argname: "sz", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "z factor; 1.0=no change" },
        { argname: "centroid", argtype: [ArgType.VEC3], defaultValue: "None", doc: "Point to scale the objects around; if None, scale each object around its own centroid" },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the resulting objects; if None, use each individual object's color." },
    ]
    },
    {
    name: 'sphere',
    doc: 'Creates a sphere.', 
    args: [
        { argname: "radius", argtype: [ArgType.POSITIVE_NUMBER], defaultValue: undefined, doc: "Sphere radius" },
        { argname: "x", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Sphere center x" },
        { argname: "y", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Sphere center y" },
        { argname: "z", argtype: [ArgType.NUMBER], defaultValue: "0.0", doc: "Sphere center z" },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object, or None for default color." },
        { argname: "resolution", argtype: [ArgType.POSITIVE_INTEGER], defaultValue: "48", doc: "How finely tessellated the sphere should be" },
    ]
    },
    {
    name: 'translate',
    doc: 'Move objects to another location. If a single object is passed in, this returns a single object. If a list is passed in, it returns a list.', 
    args: [
        { argname: "objects", argtype: [ArgType.MESH_HANDLE,ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "The objects to translate" },
        { argname: "tx", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "Change in x" },
        { argname: "ty", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "Change in y" },
        { argname: "tz", argtype: [ArgType.NUMBER], defaultValue: undefined, doc: "Change in z" },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the resulting objects; if None, use each individual object's color." },
    ]
    },
    {
    name: 'union',
    doc: 'Compute the union of several objects (a solid that encloses those points that are in any object)', 
    args: [
        { argname: "objects", argtype: [ArgType.LIST_OF_MESH_HANDLE], defaultValue: undefined, doc: "A list of the objects to join together." },
        { argname: "color", argtype: [ArgType.COLOR], defaultValue: "None", doc: "Color for the object; if None, use the color of the first object in the list" },
    ]
    },
] //end preambleFunctions list
