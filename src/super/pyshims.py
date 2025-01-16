

# This file is autogenerated. Do not edit.


import javascript  #type: ignore
import browser  #type: ignore
pi = 3.141592653589793238462643383279
_print = print

def print(*args):
    if type(args) != list and type(args) != tuple:
        args=[args]
    lst=[]
    for a in args:
        lst.append(str(a))
    tmp = ' '.join(lst)
    browser.self.impl_print(tmp)

def cube ( xsize,ysize,zsize,x=0.0,y=0.0,z=0.0,centered=False,color=None ):
    if not assertIsPositiveNumber(xsize):
        raise Exception('Parameter xsize has wrong type (expected positive number)')
    if not assertIsPositiveNumber(ysize):
        raise Exception('Parameter ysize has wrong type (expected positive number)')
    if not assertIsPositiveNumber(zsize):
        raise Exception('Parameter zsize has wrong type (expected positive number)')
    if x != 0.0 and not assertIsNumber(x):
        raise Exception('Parameter x has wrong type (expected number)')
    if y != 0.0 and not assertIsNumber(y):
        raise Exception('Parameter y has wrong type (expected number)')
    if z != 0.0 and not assertIsNumber(z):
        raise Exception('Parameter z has wrong type (expected number)')
    if centered != False and not assertIsBoolean(centered):
        raise Exception('Parameter centered has wrong type (expected boolean)')
    if color != None and not assertIsColor(color):
        raise Exception('Parameter color has wrong type (expected color)')
    if xsize is None: xsize = javascript.UNDEFINED
    if ysize is None: ysize = javascript.UNDEFINED
    if zsize is None: zsize = javascript.UNDEFINED
    if x is None: x = javascript.UNDEFINED
    if y is None: y = javascript.UNDEFINED
    if z is None: z = javascript.UNDEFINED
    if centered is None: centered = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    return browser.self.impl_cube(xsize , ysize , zsize , x , y , z , centered , color)

def sphere ( radius,x=0,y=0,z=0,color=None,resolution=48 ):
    if not assertIsPositiveNumber(radius):
        raise Exception('Parameter radius has wrong type (expected positive number)')
    if x != 0 and not assertIsNumber(x):
        raise Exception('Parameter x has wrong type (expected number)')
    if y != 0 and not assertIsNumber(y):
        raise Exception('Parameter y has wrong type (expected number)')
    if z != 0 and not assertIsNumber(z):
        raise Exception('Parameter z has wrong type (expected number)')
    if color != None and not assertIsColor(color):
        raise Exception('Parameter color has wrong type (expected color)')
    if resolution != 48 and not assertIsPositiveInteger(resolution):
        raise Exception('Parameter resolution has wrong type (expected integer > 0)')
    if radius is None: radius = javascript.UNDEFINED
    if x is None: x = javascript.UNDEFINED
    if y is None: y = javascript.UNDEFINED
    if z is None: z = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if resolution is None: resolution = javascript.UNDEFINED
    return browser.self.impl_sphere(radius , x , y , z , color , resolution)

def difference ( object1,object2,color=None ):
    if not assertIsDrawable(object1):
        raise Exception('Parameter object1 has wrong type (expected drawable object)')
    if not assertIsDrawable(object2):
        raise Exception('Parameter object2 has wrong type (expected drawable object)')
    if color != None and not assertIsColor(color):
        raise Exception('Parameter color has wrong type (expected color)')
    if object1 is None: object1 = javascript.UNDEFINED
    if object2 is None: object2 = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    return browser.self.impl_difference(object1 , object2 , color)

def assertIsNumber ( x ):
    return type(x) == int or type(x) == float

def assertIsPositiveNumber ( x ):
    return assertIsNumber(x) and x > 0

def assertIsNonnegativeNumber ( x ):
    return assertIsNumber(x) and x >= 0

def assertIsByte ( x ):
    return assertIsNumber(x) and x >= 0 and x <= 255

def assertIsBoolean ( x ):
    return (x == True or x == False)

def assertIsColor ( x ):
    if type(x) != list and type(x) != tuple:
        return False
    if len(x) != 3 and len(x) != 4:
        return False
    return all( [ assertIsByte(q) for q in x] )

def assertIsDrawable ( obj ):
    try:
        tmp = obj.to_dict()
        if tmp.get("_is_drawable_") != True:
            return False
        return True
    except Exception as e:
        return False

def assertIsListOfDrawable ( obj ):
    if type(obj) != tuple and type(obj) != list:
        return False
    return all( [ assertIsDrawable(q) for q in obj ] )

def assertIsPolygon2D ( obj ):
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) < 3:
        return False
    return all( [ assertIsVec2(q) for q in obj] )

def assertIsVec2 ( obj ):
    if type(obj) != tuple and type(obj) != list:
        return False
    if len(obj) != 2:
        return False
    return all( [ assertIsNumber(q) for q in obj] )

def assertIsNonnegativeInteger ( obj ):
    return type(obj) == int and obj >= 0

def assertIsPositiveInteger ( obj ):
    return type(obj) == int and obj > 0

def draw ( objs ):
    if type(objs) != tuple and type(objs) != list:
        objs = [objs]
    for i in range(len(objs)):
        drawHelper(objs[i],i)

def drawHelper ( obj,parameterNumber ):
    if type(obj) == list or type(obj) == tuple:
        for x in obj:
            drawHelper(x,parameterNumber)
    else:
        if not assertIsDrawable(obj):
            raise Exception(f"draw(): Parameter {parameterNumber+1} is not a drawable object or contains something that is not a drawable object")
        browser.self.impl_draw(obj)
