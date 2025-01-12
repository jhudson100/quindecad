
## this file is unused and should be removed ##

import javascript

def cube(xsize,ysize,zsize,centered=True,color=None):
    assertIsPositiveNumber(xsize)
    assertIsPositiveNumber(ysize)
    assertIsPositiveNumber(zsize)
    assertIsBoolean(centered)
    if color != None: assertIsColor(color)
    return {
        "type": "CUBE",
        "xsize": xsize,
        "ysize": ysize,
        "zsize": zsize,
        "centered": centered,
        "color": color
    }

def sphere(centerx,centery,centerz,radius,color=None,resolution=48):
    assertIsPositiveNumber(centerx)
    assertIsPositiveNumber(centery)
    assertIsPositiveNumber(centerz)
    assertIsPositiveNumber(radius)
    if color != None: assertIsColor(color)
    assertIsPositiveNumber(resolution)
    return {
        "type": "SPHERE",
        "centerx": centerx,
        "centery": centery,
        "centerz", centerz,
        "radius": radius,
        "color": color,
        "resolution",resolution
    }

def cylinder(centerx,centery,centerz,radius,height,centered=True,color=None,resolution=36):
    assertIsPositiveNumber(centerx)
    assertIsPositiveNumber(centery)
    assertIsPositiveNumber(centerz)
    assertIsPositiveNumber(radius)
    assertIsPositiveNumber(height)
    assertIsBoolean(centered)
    if color != None: assertIsColor(color)
    assertIsPositiveNumber(resolution)
    return {
        "type": "CYLINDER",
        "centerx": centerx,
        "centery": centery,
        "centerz", centerz,
        "radius": radius,
        "height": height,
        "centered": centered,
        "color": color,
        "resolution",resolution
    }


def frustum(centerx,centery,centerz,radius1,radius2,height,centered=True,color=None,resolution=36):
    assertIsPositiveNumber(centerx)
    assertIsPositiveNumber(centery)
    assertIsPositiveNumber(centerz)
    assertIsPositiveNumber(radius1)
    assertIsPositiveNumber(radius2)
    assertIsPositiveNumber(height)
    assertIsBoolean(centered)
    if color != None: assertIsColor(color)
    assertIsPositiveNumber(resolution)
    return {
        "type": "FRUSTUM",
        "centerx": centerx,
        "centery": centery,
        "centerz", centerz,
        "radius1": radius1,
        "radius2": radius2,
        "height": height,
        "centered": centered,
        "color": color,
        "resolution",resolution
    }

def union(object1,object2,color=None):
    assertIsDrawable(object1)
    assertIsDrawable(object2)
    if color != None: assertIsColor(color)
    return {
        "type": "UNION",
        "object1": object1,
        "object2": object2,
        "color": color
    }


def intersection(object1,object2,color=None):
    assertIsDrawable(object1)
    assertIsDrawable(object2)
    if color != None: assertIsColor(color)
    return {
        "type": "INTERSECTION",
        "object1": object1,
        "object2": object2,
        "color": color
    }

def difference(object1,object2,color=None):
    assertIsDrawable(object1)
    assertIsDrawable(object2)
    if color != None: assertIsColor(color)
    return {
        "type": "DIFFERENCE",
        "object1": object1,
        "object2": object2,
        "color": color
    }

def translate(object1, tx,ty,tz, color=None):
    asertIsDrawable(object1)
    assertIsNumber(tx)
    assertIsNumber(ty)
    assertIsNumber(tz)
    if color != None: assertIsColor(color)
    return {
        "type": "TRANSLATE",
        "object1": object1,
        "tx": tx,
        "ty": ty,
        "tz": tz,
        "color": color
    }

def scale(object1, sx, sy, sz, color=None):
    asertIsDrawable(object1)
    assertIsNumber(sx)
    assertIsNumber(sy)
    assertIsNumber(sz)
    if color != None: assertIsColor(color)
    return {
        "type": "TRANSLATE",
        "object1": object1,
        "sx": sx,
        "sy": sy,
        "sz": sz,
        "color": color
    }

def rotate(object1, angle, axisx, axisy, axisz, color=None):
    asertIsDrawable(object1)
    assertIsNumber(angle)
    assertIsNumber(axisx)
    assertIsNumber(axisy)
    assertIsNumber(axisz)
    if color != None: assertIsColor(color)
    return {
        "type": "ROTATE",
        "object1": object1,
        "axisx": axisx,
        "axisy": axisy,
        "axisz": axisz,
        "angle": angle,
        "color": color
    }

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
    return (type(x) == list or type(x) == tuple) and len(x) == 3 and assertIsByte(x[0]) and assertIsByte(x[1]) and assertIsByte(x[2])

def assertIsDrawable(obj):
    return (type(obj) == dict and obj.get('type') != None)


__DRAW__=[]

def draw(*objs):
    for obj in objs:
        if not assertIsDrawable(obj):
            raise Exception("Object is not drawable")
        for k in obj:
            if obj[k] == None:
                obj[k] = javascript.UNDEFINED
        __DRAW__.append(obj)
