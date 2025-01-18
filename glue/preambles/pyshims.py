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
