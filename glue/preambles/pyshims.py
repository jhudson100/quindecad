import javascript  #type: ignore
import browser  #type: ignore

#ref: Wikipedia
pi = 3.141592653589793238462643383279

#ensure we can still use the builtin print() that writes
#to the debug console
_print = print
 
def degrees(radians):
    return radians / 3.141592653589793238462643383279 * 180

def radians(degrees):
    return degrees/180 * 3.141592653589793238462643383279
