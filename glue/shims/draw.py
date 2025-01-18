from shims.gluetypes import *

def draw(objs: MESH_HANDLE|LIST_OF_MESH_HANDLE):
    """
    Draw the given objects.
    @param objs An object or a list. Lists will be recursively examined for objects to draw.
    """
    #nested function
    def drawHelper(obj, parameterNumber):
        if type(obj) == list or type(obj) == tuple:
            for x in obj:
                drawHelper(x,parameterNumber)
        else:
            if not assertIsMeshHandle(obj):
                raise Exception(f"draw(): Parameter {parameterNumber+1} is not a drawable object or contains something that is not a drawable object")
            browser.self.impl_draw(obj)

    #if we pass a single thing to draw(),
    #brython doesn't wrap it in a tuple as CPython does.
    if type(objs) != tuple and type(objs) != list:
        objs = [objs]
    for i in range(len(objs)):
        drawHelper(objs[i],i)

TS=None
