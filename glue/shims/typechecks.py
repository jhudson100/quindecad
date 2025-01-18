
def assertIsNumber(x):
    """ """
    return type(x) == int or type(x) == float

def assertIsPositiveNumber(x):
    """ """
    return assertIsNumber(x) and x > 0

def assertIsNonnegativeNumber(x):
    """ """
    return assertIsNumber(x) and x >= 0

def assertIsByte(x):
    """ """
    return assertIsNumber(x) and x >= 0 and x <= 255

def assertIsBoolean(x):
    """ """
    return (x == True or x == False)

def assertIsColor(x):
    """ """
    if type(x) != list and type(x) != tuple:
        return False
    if len(x) != 3 and len(x) != 4:
        return False
    return all( [ assertIsByte(q) for q in x] )

def assertIsMeshHandle(obj):
    """ """
    try:
        tmp = obj.to_dict()
        if tmp.get("_is_drawable_") != True:
            return False
        return True
    except Exception as e:
        return False

def assertIsListOfMeshHandle(obj):
    """ """
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) == 0:
        return False
    return all( [ assertIsMeshHandle(q) for q in obj ] )

def assertIsListOfVec3(obj):
    """ """
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) == 0:
        return False
    return all( [assertIsVec3(q) for q in obj] )

def assertIsPolygon2D(obj):
    """ """
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) < 3:
        return False
    return all( [ assertIsVec2(q) for q in obj] )

def assertIsVec2(obj):
    """ """
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) != 2:
        return False
    return all( [ assertIsNumber(q) for q in obj] )

def assertIsVec3(obj):
    """ """
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) != 3:
        return False
    return all( [ assertIsNumber(q) for q in obj] )

def assertIsNonzeroVec3(obj):
    """ """
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
    """ """
    return type(obj) == int and obj >= 0

def assertIsPositiveInteger(obj):
    """ """
    return type(obj) == int and obj > 0


TS=None
