

export enum ArgType {
    BOOLEAN,
    COLOR,
    LIST_OF_MESH_HANDLE,
    MESH_HANDLE,
    NONNEGATIVE_INTEGER,
    NONZERO_VEC3,
    NUMBER,
    POLYGON2D,
    POSITIVE_INTEGER,
    POSITIVE_NUMBER,
    VEC2,
    VEC3,
}

export interface ArgSpec {
     argname: string;
     argtype: ArgType[];
     doc: string;
     defaultValue?: string;
}
export interface FuncSpec {
    name: string,
    args: ArgSpec[],
    doc: string,
    additionalChecks?: string[]
};

export function getPreambleFunctionInfo() {
    return preambleFunctions;
}
