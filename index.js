/****************************
 * Launcher and the only module. Remakes String prototype and keeps all the generators.
 *
 * @author Evgeny Savelyev
 * @since 29.01.17
 ****************************/

"use strict";

/**
 * Map {string} task : {function} module.
 */
const taskModuleMap = {};

/**
 * Library configuration.
 */
const config = {
	lessArgAllowed : true,
	moreArgAllowed : false
};

const ARG_CHECK_ENUM = {
	NO_CHECK   : 0,
	NOT_MORE   : 1,
	NOT_LESS   : 2,
	MUST_EQUAL : 3
};

//** utility functions

const execFunc = (func, ...args) => {
	const trueArgs = [];

	for (let i = 0; i < args.length; i += 1)
		if (args[i] && args[i].constructor && args[i].constructor.name === "MereTask")
			trueArgs.push(args[i].make());
		else
			trueArgs.push(args[i]);

	return typeof func === "function" ? func(...trueArgs) : func.func(...trueArgs);
};

const getFAN = (func) => /* get formal argument number */
	typeof func === "function" ? func.length : func.mereFAN;

const ensureArgNum = (given, expected) => {
	if (!config.lessArgAllowed && given < expected)
		throw new Error(`too few arguments: given ${given}, expected ${expected}`);

	if (!config.moreArgAllowed && given > expected)
		throw new Error(`too more arguments: given ${given}, expected ${expected}`);
};

//**

class MereTask {
	constructor (func) {
		this.task = this;
		this.func = func;
	}

	make (...args) {
		if (typeof this.func !== "function" && (!this.func || typeof this.func.mereFAN !== "number"))
			throw new Error(`task ${this} is not binded to the function`);

		ensureArgNum(args.length, getFAN(this.func));

		return execFunc(this.func, ...args);
	}

	promise (...args) {
		if (typeof this.func !== "function" && (!this.func || typeof this.func.mereFAN !== "number"))
			throw new Error(`task ${this} is not binded to the function`);

		ensureArgNum(args.length, getFAN(this.func));

		return new Promise((resolve, reject) => {
			try {
				resolve(execFunc(this.func, ...args));
			} catch (err) {
				reject(err);
			}
		});
	}

	with (...args) {
		const formalArgNum = getFAN(this.func);

		if (!config.moreArgAllowed && args.length > formalArgNum)
			throw new Error(`too more arguments: given ${args.length}, expected ${formalArgNum}`);

		return new MereTask({
			mereFAN : formalArgNum - args.length,
			func : (...lastArgs) => {
				return execFunc(this.func, ...args, ...lastArgs);
			}
		});
	}

	then (task, ...secondArgs) {
		if (typeof task === "string")
			task = task.task;

		if (task && task.constructor && task.constructor.name === "Array")
			task = getArrayTask(task);

		if (!task || !task.constructor || task.constructor.name !== "MereTask")
			throw new Error(`task expected, got ${task}`);

		ensureArgNum(secondArgs.length, getFAN(task.func));

		return new MereTask({
			mereFAN : getFAN(this.func), /* to save the formal argument number */
			func    : (...args) => {
				const firstRes = execFunc(this.func, ...args);

				if (firstRes === undefined)
					return execFunc(task.func, ...secondArgs);

				return execFunc(task.func, firstRes, ...secondArgs);
			}
		});
	}
}

String.prototype.bind = function (func) {
	if (func && func.constructor) {
		if (func.constructor.name === "MereTask")
			taskModuleMap[this] = func; /* func === task */

		if (func.constructor.name === "Array")
			taskModuleMap[this] = getArrayTask(func, "binding"); /* func === task array */
		else if (typeof func === "function")
			taskModuleMap[this] = new MereTask(func);
	} else
		throw new Error("task must be binded to the function or to another task");

	return this;
};

String.prototype.__defineGetter__("task", function () {
	return taskModuleMap[this];
});

String.prototype.make = function (...args) {
	return taskModuleMap[this].make(...args);
};

String.prototype.promise = function (...args) {
	return taskModuleMap[this].promise(...args);
};

String.prototype.with = function (...args) {
	return taskModuleMap[this].with(...args);
};

String.prototype.then = function (task, ...args) {
	return taskModuleMap[this].then(task, ...args);
};

//** arrays

const getArrayTask = (arr, errFuncName) => {
	if (arr.length === 0)
		return new MereTask(() => {});

	let finalTask = typeof arr[0] === "string" ? taskModuleMap[arr[0]] : arr[0];

	if (finalTask && finalTask.constructor && finalTask.constructor.name === "Array")
		finalTask = getArrayTask(finalTask);

	if (!finalTask || !finalTask.constructor || finalTask.constructor.name !== "MereTask")
		throw new Error(`array must contain only tasks to call ${errFuncName}`);

	for (let i = 1; i < arr.length; i += 1) {
		if (typeof arr[i] !== "string" && (!arr[i] || !arr[i].constructor || arr[i].constructor.name !== "MereTask"))
			throw new Error(`array must contain only tasks to call ${errFuncName}`);

		finalTask = finalTask.then(arr[i]);
	}

	return finalTask;
};

Array.prototype.__defineGetter__("task", function () {
	return getArrayTask(this, "to the task property");
});

Array.prototype.make = function (...args) {
	if (this.length !== 0)
		return getArrayTask(this, "make()").promise(...args);
};

Array.prototype.promise = function (...args) {
	if (this.length !== 0)
		return getArrayTask(this, "promise()").promise(...args);

	return new Promise((resolve) => {
		resolve();
	});
};

Array.prototype.with = function (...args) {
	return getArrayTask(this, "with()").with(...args);
};

Array.prototype.then = function (task, ...args) {
	return getArrayTask(this, "then()").then(task, ...args);
};

/**
 * Exports.
 */
exports = module.exports = {
	NO_CHECK       : ARG_CHECK_ENUM.NO_CHECK,
	NOT_MORE       : ARG_CHECK_ENUM.NOT_MORE,
	NOT_LESS       : ARG_CHECK_ENUM.NOT_LESS,
	MUST_EQUAL     : ARG_CHECK_ENUM.MUST_EQUAL,
	getArgCheck    : () => {
		if (config.lessArgAllowed && config.moreArgAllowed)
			return ARG_CHECK_ENUM.NO_CHECK;

		if (config.lessArgAllowed)
			return ARG_CHECK_ENUM.NOT_MORE;

		if (config.moreArgAllowed)
			return ARG_CHECK_ENUM.NOT_LESS;

		return ARG_CHECK_ENUM.MUST_EQUAL;
	},
	setArgCheck    : (type) => {
		if (type > 3)
			throw new Error(`invalid argument checking type: ${type} (use mere.ARG_CHECK_ENUM)`);

		if (type < 2)
			config.lessArgAllowed = true;

		if (type === 0)
			config.moreArgAllowed = true;
	}
};