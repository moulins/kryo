import * as Promise from "bluebird";
import {Type} from "./interfaces/Type";

export class BooleanType implements Type{
	name: string = "boolean";
	options: {[key: string]: any};

	read(format: string, val: any): Promise<boolean> {
		return Promise.resolve(Boolean(val));
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
		return Promise.resolve<boolean|Error>(this.testSync(val));
	}

	normalize(val: any): Promise<boolean> {
		return Promise.resolve(Boolean(val));
	}

	equals(val1: boolean, val2: boolean): Promise<boolean> {
		return Promise.resolve(val1 === val2);
	}

	clone(val: boolean): Promise<boolean> {
		return Promise.resolve(val);
	}

	diff(oldVal: boolean, newVal: boolean): Promise<boolean> {
		return Promise.resolve(oldVal !== newVal);
	}

	patch(oldVal: boolean, diff: boolean): Promise<boolean> {
		return Promise.resolve(diff ? !oldVal : oldVal);
	}

	revert(newVal: boolean, diff: boolean): Promise<boolean> {
		return Promise.resolve(diff ? !newVal : newVal);
	}
}
