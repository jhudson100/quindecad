

# This file is autogenerated. Do not edit.


import javascript  #type: ignore
import browser  #type: ignore

#ref: Wikipedia
pi = 3.141592653589793238462643383279

#ensure we can still use the builtin print() that writes
#to the debug console
_print = print

#if we send a single thing to print(),
#brython does not wrap it in a tuple as
#CPython does.
# ~ def print(*args):
    # ~ if type(args) != list and type(args) != tuple:
        # ~ args=[args]
    # ~ lst=[]
    # ~ for a in args:
        # ~ lst.append(str(a))
    # ~ tmp = ' '.join(lst)
    # ~ browser.self.impl_print(tmp)

def degrees(radians):
    return radians / 3.141592653589793238462643383279 * 180

def radians(degrees):
    return degrees/180 * 3.141592653589793238462643383279


def boundingbox ( objects ):
    if not any([assertIsMeshHandle(objects),assertIsListOfMeshHandle(objects)]):
        raise Exception(f'Parameter "objects" has wrong type (expected drawable object, or list of drawable objects); got {type(objects)}')
    if objects is None: objects = javascript.UNDEFINED
    return browser.self.impl_boundingbox(objects)

def box ( min,max,color=None,name=None ):
    if not assertIsVec3(min) :
        raise Exception(f'Parameter "min" has wrong type (expected tuple of three numbers); got {type(min)}')
    if not assertIsVec3(max) :
        raise Exception(f'Parameter "max" has wrong type (expected tuple of three numbers); got {type(max)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if min is None: min = javascript.UNDEFINED
    if max is None: max = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_box(min , max , color , name)

def centroid ( objects ):
    if not any([assertIsMeshHandle(objects),assertIsListOfMeshHandle(objects)]):
        raise Exception(f'Parameter "objects" has wrong type (expected drawable object, or list of drawable objects); got {type(objects)}')
    if objects is None: objects = javascript.UNDEFINED
    return browser.self.impl_centroid(objects)

def cube ( xsize,ysize,zsize,x=0.0,y=0.0,z=0.0,centered=False,color=None,name=None ):
    if not assertIsPositiveNumber(xsize) :
        raise Exception(f'Parameter "xsize" has wrong type (expected positive number); got {type(xsize)}')
    if not assertIsPositiveNumber(ysize) :
        raise Exception(f'Parameter "ysize" has wrong type (expected positive number); got {type(ysize)}')
    if not assertIsPositiveNumber(zsize) :
        raise Exception(f'Parameter "zsize" has wrong type (expected positive number); got {type(zsize)}')
    if not assertIsNumber(x)  and not( type(x) == type(0.0) and x == 0.0):
        raise Exception(f'Parameter "x" has wrong type (expected number); got {type(x)}')
    if not assertIsNumber(y)  and not( type(y) == type(0.0) and y == 0.0):
        raise Exception(f'Parameter "y" has wrong type (expected number); got {type(y)}')
    if not assertIsNumber(z)  and not( type(z) == type(0.0) and z == 0.0):
        raise Exception(f'Parameter "z" has wrong type (expected number); got {type(z)}')
    if not assertIsBoolean(centered)  and not( type(centered) == type(False) and centered == False):
        raise Exception(f'Parameter "centered" has wrong type (expected boolean); got {type(centered)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if xsize is None: xsize = javascript.UNDEFINED
    if ysize is None: ysize = javascript.UNDEFINED
    if zsize is None: zsize = javascript.UNDEFINED
    if x is None: x = javascript.UNDEFINED
    if y is None: y = javascript.UNDEFINED
    if z is None: z = javascript.UNDEFINED
    if centered is None: centered = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_cube(xsize , ysize , zsize , x , y , z , centered , color , name)

def cut ( objects,planeNormal,planeD,keepPositive,color=None,name=None ):
    if not any([assertIsMeshHandle(objects),assertIsListOfMeshHandle(objects)]):
        raise Exception(f'Parameter "objects" has wrong type (expected drawable object, or list of drawable objects); got {type(objects)}')
    if not assertIsNonzeroVec3(planeNormal) :
        raise Exception(f'Parameter "planeNormal" has wrong type (expected tuple of three numbers with x**2 + y**2 + z**2 > 0); got {type(planeNormal)}')
    if not assertIsNumber(planeD) :
        raise Exception(f'Parameter "planeD" has wrong type (expected number); got {type(planeD)}')
    if not assertIsBoolean(keepPositive) :
        raise Exception(f'Parameter "keepPositive" has wrong type (expected boolean); got {type(keepPositive)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if planeNormal is None: planeNormal = javascript.UNDEFINED
    if planeD is None: planeD = javascript.UNDEFINED
    if keepPositive is None: keepPositive = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_cut(objects , planeNormal , planeD , keepPositive , color , name)

def cylinder ( x,y,z,radius,height,zcenter=True,color=None,resolution=36,name=None ):
    if not assertIsNumber(x) :
        raise Exception(f'Parameter "x" has wrong type (expected number); got {type(x)}')
    if not assertIsNumber(y) :
        raise Exception(f'Parameter "y" has wrong type (expected number); got {type(y)}')
    if not assertIsNumber(z) :
        raise Exception(f'Parameter "z" has wrong type (expected number); got {type(z)}')
    if not assertIsPositiveNumber(radius) :
        raise Exception(f'Parameter "radius" has wrong type (expected positive number); got {type(radius)}')
    if not assertIsPositiveNumber(height) :
        raise Exception(f'Parameter "height" has wrong type (expected positive number); got {type(height)}')
    if not assertIsBoolean(zcenter)  and not( type(zcenter) == type(True) and zcenter == True):
        raise Exception(f'Parameter "zcenter" has wrong type (expected boolean); got {type(zcenter)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsPositiveInteger(resolution)  and not( type(resolution) == type(36) and resolution == 36):
        raise Exception(f'Parameter "resolution" has wrong type (expected integer > 0); got {type(resolution)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if x is None: x = javascript.UNDEFINED
    if y is None: y = javascript.UNDEFINED
    if z is None: z = javascript.UNDEFINED
    if radius is None: radius = javascript.UNDEFINED
    if height is None: height = javascript.UNDEFINED
    if zcenter is None: zcenter = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if resolution is None: resolution = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_cylinder(x , y , z , radius , height , zcenter , color , resolution , name)

def difference ( objects,color=None,name=None ):
    if not assertIsListOfMeshHandle(objects) :
        raise Exception(f'Parameter "objects" has wrong type (expected list of drawable objects); got {type(objects)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_difference(objects , color , name)

def draw ( objs ):
    if not any([assertIsMeshHandle(objs),assertIsListOfMeshHandle(objs)]):
        raise Exception(f'Parameter "objs" has wrong type (expected drawable object, or list of drawable objects); got {type(objs)}')
    def drawHelper(obj, parameterNumber):
        if assertIsList(obj):
            for x in obj:
                drawHelper(x,parameterNumber)
        else:
            if not assertIsMeshHandle(obj):
                raise Exception(f"draw(): List element {parameterNumber} is not a drawable object or contains something that is not a drawable object ({type(obj)})")
            if not browser.self.impl_draw(obj):
                raise Exception(f"Internal error when drawing list element {parameterNumber}")

    if type(objs) != tuple and type(objs) != list:
        objs = [objs]
    for i in range(len(objs)):
        drawHelper(objs[i],i)

def extrude ( polygon,height,divisions=None,twist=None,scale=None,zcenter=False,color=None,name=None ):
    if not assertIsPolygon2D(polygon) :
        raise Exception(f'Parameter "polygon" has wrong type (expected 2D polygon); got {type(polygon)}')
    if not assertIsPositiveNumber(height) :
        raise Exception(f'Parameter "height" has wrong type (expected positive number); got {type(height)}')
    if not assertIsPositiveInteger(divisions)  and not( type(divisions) == type(None) and divisions == None):
        raise Exception(f'Parameter "divisions" has wrong type (expected integer > 0); got {type(divisions)}')
    if not assertIsNumber(twist)  and not( type(twist) == type(None) and twist == None):
        raise Exception(f'Parameter "twist" has wrong type (expected number); got {type(twist)}')
    if not assertIsVec2(scale)  and not( type(scale) == type(None) and scale == None):
        raise Exception(f'Parameter "scale" has wrong type (expected tuple of two numbers); got {type(scale)}')
    if not assertIsBoolean(zcenter)  and not( type(zcenter) == type(False) and zcenter == False):
        raise Exception(f'Parameter "zcenter" has wrong type (expected boolean); got {type(zcenter)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if polygon is None: polygon = javascript.UNDEFINED
    if height is None: height = javascript.UNDEFINED
    if divisions is None: divisions = javascript.UNDEFINED
    if twist is None: twist = javascript.UNDEFINED
    if scale is None: scale = javascript.UNDEFINED
    if zcenter is None: zcenter = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_extrude(polygon , height , divisions , twist , scale , zcenter , color , name)

def free ( obj ):
    if not assertIsMeshHandle(obj) :
        raise Exception(f'Parameter "obj" has wrong type (expected drawable object); got {type(obj)}')
    if obj is None: obj = javascript.UNDEFINED
    return browser.self.impl_free(obj)

def frustum ( radius1,radius2,height,x=0.0,y=0.0,z=0.0,zcenter=True,color=None,resolution=36,name=None ):
    if not assertIsPositiveNumber(radius1) :
        raise Exception(f'Parameter "radius1" has wrong type (expected positive number); got {type(radius1)}')
    if not assertIsPositiveNumber(radius2) :
        raise Exception(f'Parameter "radius2" has wrong type (expected positive number); got {type(radius2)}')
    if not assertIsPositiveNumber(height) :
        raise Exception(f'Parameter "height" has wrong type (expected positive number); got {type(height)}')
    if not assertIsNumber(x)  and not( type(x) == type(0.0) and x == 0.0):
        raise Exception(f'Parameter "x" has wrong type (expected number); got {type(x)}')
    if not assertIsNumber(y)  and not( type(y) == type(0.0) and y == 0.0):
        raise Exception(f'Parameter "y" has wrong type (expected number); got {type(y)}')
    if not assertIsNumber(z)  and not( type(z) == type(0.0) and z == 0.0):
        raise Exception(f'Parameter "z" has wrong type (expected number); got {type(z)}')
    if not assertIsBoolean(zcenter)  and not( type(zcenter) == type(True) and zcenter == True):
        raise Exception(f'Parameter "zcenter" has wrong type (expected boolean); got {type(zcenter)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsPositiveInteger(resolution)  and not( type(resolution) == type(36) and resolution == 36):
        raise Exception(f'Parameter "resolution" has wrong type (expected integer > 0); got {type(resolution)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if radius1 is None: radius1 = javascript.UNDEFINED
    if radius2 is None: radius2 = javascript.UNDEFINED
    if height is None: height = javascript.UNDEFINED
    if x is None: x = javascript.UNDEFINED
    if y is None: y = javascript.UNDEFINED
    if z is None: z = javascript.UNDEFINED
    if zcenter is None: zcenter = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if resolution is None: resolution = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_frustum(radius1 , radius2 , height , x , y , z , zcenter , color , resolution , name)

def genus ( obj ):
    if not assertIsMeshHandle(obj) :
        raise Exception(f'Parameter "obj" has wrong type (expected drawable object); got {type(obj)}')
    if obj is None: obj = javascript.UNDEFINED
    return browser.self.impl_genus(obj)

def hull ( objects,color=None,name=None ):
    if not any([assertIsMeshHandle(objects),assertIsListOfMeshHandle(objects)]):
        raise Exception(f'Parameter "objects" has wrong type (expected drawable object, or list of drawable objects); got {type(objects)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_hull(objects , color , name)

def intersection ( objects,color=None,name=None ):
    if not assertIsListOfMeshHandle(objects) :
        raise Exception(f'Parameter "objects" has wrong type (expected list of drawable objects); got {type(objects)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_intersection(objects , color , name)

def assertIsBoolean ( x ):
    return (x == True or x == False)

def assertIsByte ( x ):
    return assertIsNumber(x) and x >= 0 and x <= 255

def assertIsColor ( x ):
    if not assertIsList(x):
        return False
    if len(x) != 3 and len(x) != 4:
        return False
    return all( [ assertIsByte(q) for q in x] )

def assertIsList ( x ):
    return type(x) == list or type(x) == tuple or type(x) == javascript.Array

def assertIsListOfMeshHandle ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) == 0:
        return False
    return all( [ assertIsMeshHandle(q) for q in obj ] )

def assertIsListOfVec3 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) == 0:
        return False
    return all( [assertIsVec3(q) for q in obj] )

def assertIsMeshHandle ( obj ):
    try:
        tmp = obj.to_dict()
        if tmp.get("_is_drawable_") != True:
            return False
        return True
    except Exception as e:
        return False

def assertIsNonnegativeInteger ( obj ):
    return type(obj) == int and obj >= 0

def assertIsNonnegativeNumber ( x ):
    return assertIsNumber(x) and x >= 0

def assertIsNonzeroVec3 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) != 3:
        return False
    if not all( [ assertIsNumber(q) for q in obj] ):
        return False
    if obj[0]*obj[0] + obj[1]*obj[1] + obj[2]*obj[2] < 0.001:
        return False
    return True

def assertIsNumber ( x ):
    return type(x) == int or type(x) == float

def assertIsPolygon2D ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) < 3:
        return False
    return all( [ assertIsVec2(q) for q in obj] )

def assertIsPositiveInteger ( obj ):
    return type(obj) == int and obj > 0

def assertIsPositiveNumber ( x ):
    return assertIsNumber(x) and x > 0

def assertIsString ( obj ):
    return type(obj) == str

def assertIsVec2 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) != 2:
        return False
    return all( [ assertIsNumber(q) for q in obj] )

def assertIsVec3 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) != 3:
        return False
    return all( [ assertIsNumber(q) for q in obj] )

def print ( args ):
    if type(args) != list and type(args) != tuple:
        args=[args]
    lst=[]
    for a in args:
        lst.append(str(a))
    tmp = ' '.join(lst)
    browser.self.impl_print(tmp)

def revolve ( polygon,angle=None,color=None,resolution=36,name=None ):
    if not assertIsPolygon2D(polygon) :
        raise Exception(f'Parameter "polygon" has wrong type (expected 2D polygon); got {type(polygon)}')
    if not assertIsNumber(angle)  and not( type(angle) == type(None) and angle == None):
        raise Exception(f'Parameter "angle" has wrong type (expected number); got {type(angle)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsPositiveInteger(resolution)  and not( type(resolution) == type(36) and resolution == 36):
        raise Exception(f'Parameter "resolution" has wrong type (expected integer > 0); got {type(resolution)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if polygon is None: polygon = javascript.UNDEFINED
    if angle is None: angle = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if resolution is None: resolution = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_revolve(polygon , angle , color , resolution , name)

def rotate ( objects,axis,angle,centroid=None,color=None,name=None ):
    if not any([assertIsMeshHandle(objects),assertIsListOfMeshHandle(objects)]):
        raise Exception(f'Parameter "objects" has wrong type (expected drawable object, or list of drawable objects); got {type(objects)}')
    if not assertIsNonzeroVec3(axis) :
        raise Exception(f'Parameter "axis" has wrong type (expected tuple of three numbers with x**2 + y**2 + z**2 > 0); got {type(axis)}')
    if not assertIsNumber(angle) :
        raise Exception(f'Parameter "angle" has wrong type (expected number); got {type(angle)}')
    if not assertIsVec3(centroid)  and not( type(centroid) == type(None) and centroid == None):
        raise Exception(f'Parameter "centroid" has wrong type (expected tuple of three numbers); got {type(centroid)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if axis is None: axis = javascript.UNDEFINED
    if angle is None: angle = javascript.UNDEFINED
    if centroid is None: centroid = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_rotate(objects , axis , angle , centroid , color , name)

def scale ( objects,sx,sy,sz,centroid=None,color=None,name=None ):
    if not any([assertIsMeshHandle(objects),assertIsListOfMeshHandle(objects)]):
        raise Exception(f'Parameter "objects" has wrong type (expected drawable object, or list of drawable objects); got {type(objects)}')
    if not assertIsNumber(sx) :
        raise Exception(f'Parameter "sx" has wrong type (expected number); got {type(sx)}')
    if not assertIsNumber(sy) :
        raise Exception(f'Parameter "sy" has wrong type (expected number); got {type(sy)}')
    if not assertIsNumber(sz) :
        raise Exception(f'Parameter "sz" has wrong type (expected number); got {type(sz)}')
    if not assertIsVec3(centroid)  and not( type(centroid) == type(None) and centroid == None):
        raise Exception(f'Parameter "centroid" has wrong type (expected tuple of three numbers); got {type(centroid)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if sx is None: sx = javascript.UNDEFINED
    if sy is None: sy = javascript.UNDEFINED
    if sz is None: sz = javascript.UNDEFINED
    if centroid is None: centroid = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_scale(objects , sx , sy , sz , centroid , color , name)

def sphere ( radius,x=0.0,y=0.0,z=0.0,color=None,resolution=48,name=None ):
    if not assertIsPositiveNumber(radius) :
        raise Exception(f'Parameter "radius" has wrong type (expected positive number); got {type(radius)}')
    if not assertIsNumber(x)  and not( type(x) == type(0.0) and x == 0.0):
        raise Exception(f'Parameter "x" has wrong type (expected number); got {type(x)}')
    if not assertIsNumber(y)  and not( type(y) == type(0.0) and y == 0.0):
        raise Exception(f'Parameter "y" has wrong type (expected number); got {type(y)}')
    if not assertIsNumber(z)  and not( type(z) == type(0.0) and z == 0.0):
        raise Exception(f'Parameter "z" has wrong type (expected number); got {type(z)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsPositiveInteger(resolution)  and not( type(resolution) == type(48) and resolution == 48):
        raise Exception(f'Parameter "resolution" has wrong type (expected integer > 0); got {type(resolution)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if radius is None: radius = javascript.UNDEFINED
    if x is None: x = javascript.UNDEFINED
    if y is None: y = javascript.UNDEFINED
    if z is None: z = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if resolution is None: resolution = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_sphere(radius , x , y , z , color , resolution , name)

def translate ( objects,tx,ty,tz,color=None,name=None ):
    if not any([assertIsMeshHandle(objects),assertIsListOfMeshHandle(objects)]):
        raise Exception(f'Parameter "objects" has wrong type (expected drawable object, or list of drawable objects); got {type(objects)}')
    if not assertIsNumber(tx) :
        raise Exception(f'Parameter "tx" has wrong type (expected number); got {type(tx)}')
    if not assertIsNumber(ty) :
        raise Exception(f'Parameter "ty" has wrong type (expected number); got {type(ty)}')
    if not assertIsNumber(tz) :
        raise Exception(f'Parameter "tz" has wrong type (expected number); got {type(tz)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if tx is None: tx = javascript.UNDEFINED
    if ty is None: ty = javascript.UNDEFINED
    if tz is None: tz = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_translate(objects , tx , ty , tz , color , name)

def assertIsBoolean ( x ):
    return (x == True or x == False)

def assertIsByte ( x ):
    return assertIsNumber(x) and x >= 0 and x <= 255

def assertIsColor ( x ):
    if not assertIsList(x):
        return False
    if len(x) != 3 and len(x) != 4:
        return False
    return all( [ assertIsByte(q) for q in x] )

def assertIsList ( x ):
    return type(x) == list or type(x) == tuple or type(x) == javascript.Array

def assertIsListOfMeshHandle ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) == 0:
        return False
    return all( [ assertIsMeshHandle(q) for q in obj ] )

def assertIsListOfVec3 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) == 0:
        return False
    return all( [assertIsVec3(q) for q in obj] )

def assertIsMeshHandle ( obj ):
    try:
        tmp = obj.to_dict()
        if tmp.get("_is_drawable_") != True:
            return False
        return True
    except Exception as e:
        return False

def assertIsNonnegativeInteger ( obj ):
    return type(obj) == int and obj >= 0

def assertIsNonnegativeNumber ( x ):
    return assertIsNumber(x) and x >= 0

def assertIsNonzeroVec3 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) != 3:
        return False
    if not all( [ assertIsNumber(q) for q in obj] ):
        return False
    if obj[0]*obj[0] + obj[1]*obj[1] + obj[2]*obj[2] < 0.001:
        return False
    return True

def assertIsNumber ( x ):
    return type(x) == int or type(x) == float

def assertIsPolygon2D ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) < 3:
        return False
    return all( [ assertIsVec2(q) for q in obj] )

def assertIsPositiveInteger ( obj ):
    return type(obj) == int and obj > 0

def assertIsPositiveNumber ( x ):
    return assertIsNumber(x) and x > 0

def assertIsString ( obj ):
    return type(obj) == str

def assertIsVec2 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) != 2:
        return False
    return all( [ assertIsNumber(q) for q in obj] )

def assertIsVec3 ( obj ):
    if not assertIsList(obj):
        return False
    if len(obj) != 3:
        return False
    return all( [ assertIsNumber(q) for q in obj] )

def union ( objects,color=None,name=None ):
    if not assertIsListOfMeshHandle(objects) :
        raise Exception(f'Parameter "objects" has wrong type (expected list of drawable objects); got {type(objects)}')
    if not assertIsColor(color)  and not( type(color) == type(None) and color == None):
        raise Exception(f'Parameter "color" has wrong type (expected color); got {type(color)}')
    if not assertIsString(name)  and not( type(name) == type(None) and name == None):
        raise Exception(f'Parameter "name" has wrong type (expected string); got {type(name)}')
    if objects is None: objects = javascript.UNDEFINED
    if color is None: color = javascript.UNDEFINED
    if name is None: name = javascript.UNDEFINED
    return browser.self.impl_union(objects , color , name)
