import * as Promise from "bluebird";
import {SyncType} from "./interfaces/Type";

export class BooleanType implements SyncType{
	name: string = "boolean";
	options: {[key: string]: any};

	readSync(format: string, val: any): boolean {
		return Boolean(val);
	}

	read(format: string, val: any): Promise<boolean> {
		return Promise.resolve(Boolean(val));
	}

	writeSync(format: string, val: boolean): any {
		return Boolean(val);
	}

	write(format: string, val: boolean): Promise<any> {
		return Promise.resolve(Boolean(val));
	}

	testSync(val: any): boolean|Error {
		if (typeof val !== "boolean") {
			return new Error('Expected typeof val to be "boolean"');
		}
		return true;
	}

	test(val: any): Promise<boolean|Error> {
		return Promise.resolve(this.testSync(val));
	}

	normalizeSync(val: boolean): boolean {
		return Boolean(val);
	}

	normalize(val: any): Promise<boolean> {
		return Promise.resolve(Boolean(val));
	}

	equalsSync(val1: boolean, val2: boolean): boolean {
		return val1 === val2;
	}

	equals(val1: boolean, val2: boolean): Promise<boolean> {
		return Promise.resolve(val1 === val2);
	}

	cloneSync(val: boolean): boolean {
		return val;
	}

	clone(val: boolean): Promise<boolean> {
		return Promise.resolve(val);
	}

	diffSync(oldVal: boolean, newVal: boolean): boolean {
		return oldVal !== newVal;
	}

	diff(oldVal: boolean, newVal: boolean): Promise<boolean> {
		return Promise.resolve(oldVal !== newVal);
	}

	patchSync(oldVal: boolean, diff: boolean): boolean {
		return diff ? !oldVal : oldVal;
	}

	patch(oldVal: boolean, diff: boolean): Promise<boolean> {
		return Promise.resolve(diff ? !oldVal : oldVal);
	}

	revertSync(newVal: boolean, diff: boolean): boolean {
		return diff ? !newVal : newVal;
	}

	revert(newVal: boolean, diff: boolean): Promise<boolean> {
		return Promise.resolve(diff ? !newVal : newVal);
	}
}
