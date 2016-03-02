export interface TypeAsync<T, D> {
  isSync: boolean;
  name: string;

  read(format: string, val: any): Promise<T>;
  write(format: string, val: T): Promise<any>;
  test(val: any): Promise<Error>;
  normalize(val: any): Promise<T>;
  equals(val1: T, val2: T): Promise<boolean>;
  clone(val: T): Promise<T>;
  diff(oldVal: T, newVal: T): Promise<D>;
  patch(oldVal: T, diff: D): Promise<T>;
  revert(newVal: T, diff: D): Promise<T>;
}

export interface TypeSync<T, D> {
  isSync: boolean;
  name: string;

  readSync(format: string, val: any): T;
  writeSync(format: string, val: T): any;
  testSync(val: any): Error;
  normalizeSync(val: any): T;
  equalsSync(val1: T, val2: T): boolean;
  cloneSync(val: T): T;
  diffSync(oldVal: T, newVal: T): D;
  patchSync(oldVal: T, diff: D): T;
  revertSync(newVal: T, diff: D): T;
}

export interface Type<T, D> extends TypeAsync<T, D> {
  isSync: boolean;

  readSync?(format: string, val: any): T;
  writeSync?(format: string, val: T): any;
  testSync?(val: any): Error;
  normalizeSync?(val: any): T;
  equalsSync?(val1: T, val2: T): boolean;
  cloneSync?(val: T): T;
  diffSync?(oldVal: T, newVal: T): D;
  patchSync?(oldVal: T, diff: D): T;
  revertSync?(newVal: T, diff: D): T;
}

export interface StaticTypeSync<T, D> {
  new(...args: any[]): TypeSync<T, D>;
  prototype?: TypeSync<T, D>;
}

export interface StaticType<T, D> {
  new(...args: any[]): Type<T, D>;
  prototype?: Type<T, D>;
}

export function promisify<T, D>(typeSync: TypeSync<T, D>): Type<T, D> {
  let type: Type<T, D> = <any>typeSync;
  type.isSync = true;

  if (!type.read) {
    type.read = function(format: string, val: any): Promise<T> {
      return Promise.try(<() => T>this.readSync, [format, val], this);
    }
  }

  if (!type.write) {
    type.write = function(format: string, val: T): Promise<any> {
      return Promise.try(<() => any>this.writeSync, [format, val], this);
    }
  }

  if (!type.test) {
    type.test = function(val: any): Promise<Error> {
      return Promise.try(<() => Error>this.testSync, [val], this);
    }
  }

  if (!type.normalize) {
    type.normalize = function(val: any): Promise<T> {
      return Promise.try(<() => T>this.normalizeSync, [val], this);
    }
  }

  if (!type.equals) {
    type.equals = function(val1: T, val2: T): Promise<boolean> {
      return Promise.try(<() => boolean>this.equalsSync, [val1, val2], this);
    }
  }

  if (!type.clone) {
    type.clone = function(val: T): Promise<T> {
      return Promise.try(<() => T>this.cloneSync, [val], this);
    }
  }

  if (!type.diff) {
    type.diff = function(oldVal: T, newVal: T): Promise<D> {
      return Promise.try(<() => D>this.diffSync, [oldVal, newVal], this);
    }
  }

  if (!type.patch) {
    type.patch = function(oldVal: T, diff: D): Promise<T> {
      return Promise.try(<() => T>this.patchSync, [oldVal, diff], this);
    }
  }

  if (!type.revert) {
    type.revert = function(newVal: T, diff: D): Promise<T> {
      return Promise.try(<() => T>this.revertSync, [newVal, diff], this);
    }
  }

  return type;
}

export function promisifyClass<T, D>(typeSync: StaticTypeSync<T, D>): StaticType<T, D> {
  promisify(typeSync.prototype);
  return <StaticType<T, D>> <any> typeSync;
}
