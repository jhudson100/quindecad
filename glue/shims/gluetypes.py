
class NUMBER:
    checker="assertIsNumber"
    name="number"
class POSITIVE_NUMBER:
    checker="assertIsPositiveNumber"
    name="positive number"
class COLOR:
    checker="assertIsColor"
    name="color"
class MESH_HANDLE:
    checker="assertIsMeshHandle"
    name="solid object"
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
class LIST_OF_MESH_HANDLE:
    checker="assertIsListOfMeshHandle"
    name="list of solid objects"
class LIST_OF_VEC3:
    checker="assertIsListOfVec3"
    name="list of tuples, each of which is [x,y,z]"
class STRING:
    checker="assertIsString"
    name="string"

#js types for python types
jstypemap = {
    None: "void",
    NUMBER: "number",
    POSITIVE_NUMBER: "number",
    COLOR: "PyColor",
    MESH_HANDLE: "MeshHandle",
    POLYGON2D: "Vec2[]",
    VEC2: "Vec2",
    VEC3: "Vec3",
    NONZERO_VEC3: "Vec3",
    LIST_OF_VEC3: "Vec3[]",
    NONNEGATIVE_INTEGER: "number",
    POSITIVE_INTEGER: "number",
    BOOLEAN: "boolean",
    LIST_OF_MESH_HANDLE: "MeshHandle[]",
    MESH_HANDLE|LIST_OF_MESH_HANDLE: "MeshHandle|MeshHandle[]",
    STRING: "string"
}
