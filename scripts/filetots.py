#!/usr/bin/python

#convert an arbitrary file to a base64 typescript file.

import sys
import base64

mimes={
    ".svg":"image/svg+xml"
}

inputFilename = sys.argv[1]
outputFilename = sys.argv[2]
variableName = sys.argv[3]

idx = inputFilename.rfind(".")
assert idx != -1

suffix = inputFilename[idx:]
mimeType = mimes[suffix]

with open(inputFilename,"rb") as fp:
    data = fp.read()

b64 = base64.b64encode(data).decode()

lineLength=80
with open(outputFilename,"w") as fp:
    print(f"export const {variableName} = `data:{mimeType};base64,",file=fp)
    for i in range(0,len(b64),lineLength):
        print(b64[i:i+lineLength],file=fp)
    print("`;",file=fp)
