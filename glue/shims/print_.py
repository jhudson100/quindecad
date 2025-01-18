from shims.typechecks import *

def print(*args):
    """
    Print data to the screen.
    @param args One or more things to print
    """
    #if we send a single thing to print(),
    #brython does not wrap it in a tuple as
    #CPython does.
    if type(args) != list and type(args) != tuple:
        args=[args]
    lst=[]
    for a in args:
        lst.append(str(a))
    tmp = ' '.join(lst)
    browser.self.impl_print(tmp)

TS=None
