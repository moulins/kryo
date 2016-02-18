import * as Promise from "bluebird";
import {Type, TypeSync} from "./interfaces/Type";

export class IntegerType implements Type, TypeSync{
	name: string = "boolean";
	options: {[key: string]: any};

	readSync(format: string, val: any): number {
		return val;
	}

	read(format: string, val: number): Promise<number> {
		return Promise.resolve(val);
	}

	writeSync(format: string, val: number): any {
		return val;
	}

	write(format: string, val: number): Promise<any> {
		return Promise.resolve(val);
	}

	testSync(val: any): boolean|Error {
		return typeof val === "number" && isFinite(val) && Math.floor(val) === val;
	}

	test(val: any): Promise<boolean|Error> {
		return Promise.resolve(this.testSync(val));
	}

	normalizeSync(val: any): number {
		return Math.floor(val);
	}

	normalize(val: any): Promise<number> {
		return Promise.resolve(Math.floor(val));
	}

	equalsSync(val1: number, val2: number): boolean {
		return val1 === val2;
	}

	equals(val1: number, val2: number): Promise<boolean> {
		return Promise.resolve(val1 === val2);
	}

	cloneSync(val: number): number {
		return val;
	}

	clone(val: number): Promise<number> {
		return Promise.resolve(val);
	}

	diffSync(oldVal: number, newVal: number): number {
		return newVal - oldVal;
	}

	diff(oldVal: number, newVal: number): Promise<number> {
		return Promise.resolve(newVal-oldVal);
	}

	patchSync(oldVal: number, diff: number): number {
		return oldVal + diff;
	}

	patch(oldVal: number, diff: number): Promise<number> {
		return Promise.resolve(oldVal+diff);
	}

	revertSync(newVal: number, diff: number): number {
		return newVal - diff;
	}

	revert(newVal: number, diff: number): Promise<number> {
		return Promise.resolve(newVal-diff);
	}
}
