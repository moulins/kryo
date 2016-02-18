export interface Type{
  name: string;
  options: {[key: string]: any};

  read(format: string, val: any): Promise<any>;
  write(format: string, val: any): Promise<any>;
  test(val: any): Promise<boolean | Error>;
  normalize(val: any): Promise<any>;
  equals(val1: any, val2: any): Promise<any>;
  clone(val: any): Promise<any>;
  diff(oldVal: any, newVal: any): Promise<any>;
  patch(oldVal: any, diff: any): Promise<any>;
  revert(newVal: any, diff: any): Promise<any>;
}

export interface TypeSync {
  readSync(format: string, val: any): any;
  writeSync(format: string, val: any): any;
  testSync(val: any): boolean | Error;
  normalizeSync(val: any): any;
  equalsSync(val1: any, val2: any): any;
  cloneSync(val: any): any;
  diffSync(oldVal: any, newVal: any): any;
  patchSync(oldVal: any, diff: any): any;
  revertSync(newVal: any, diff: any): any;
}
