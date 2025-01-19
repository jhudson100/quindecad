


export interface ArgSpec {
     argname: string;
     argtypes: string[];
     argtypesVerbose: string[];       //longer version of argument type, with explanation
     doc: string;
     defaultValue?: string;
}
export interface FuncSpec {
    name: string,
    args: ArgSpec[],
    doc: string,
};

let preambleFunctions: Map<string,FuncSpec>;

export function getPreambleFunctionInfo():  Map<string,FuncSpec> {
    return preambleFunctions;
}
