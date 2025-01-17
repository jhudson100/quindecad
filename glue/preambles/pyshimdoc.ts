

export enum ArgType { NUMBER, POSITIVE_NUMBER,
        BOOLEAN, COLOR, MESH_HANDLE, LIST_OF_MESH_HANDLE,
        POLYGON2D, VEC2, NONNEGATIVE_INTEGER, POSITIVE_INTEGER }

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
