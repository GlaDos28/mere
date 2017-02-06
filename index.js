/****************************
 * Launcher and the only module. Remakes String prototype and keeps all the generators.
 *
 * @author Evgeny Savelyev
 * @since 29.01.17
 ****************************/

"use strict";

/**
 * Imports.
 */
const
	MereTask              = require("./src/MereTask"),
	isPromise             = require("./src/util/isPromise"),
	isTask                = require("./src/util/isTask"),
	wrapInArr             = require("./src/util/wrapInArr"),
	config                = require("./src/configuration");

/**
 * Map {string} task : {function} module.
 */
let taskModuleMap = {};

/* eslint-disable no-extend-native */

//** string prototype

String.prototype.bind = function (func) {
	if (func && func.constructor) {
		if (func.constructor.name === "MereTask")
			taskModuleMap[this] = func; /* func === task */
		else if (func.constructor.name === "Array")
			taskModuleMap[this] = getArrayTask(func, "binding"); /* func === task array */
		else if (typeof func === "function")
			taskModuleMap[this] = new MereTask(func);
		else
			throw new Error("task must be binded to the function or to another task");
	} else
		throw new Error("task must be binded to the function or to another task");

	return this;
};

String.prototype.__defineGetter__("task", function () {
	return taskModuleMap[this];
});

String.prototype.__defineGetter__("frozenTask", function () {
	return taskModuleMap[this].frozenTask;
});

String.prototype.__defineGetter__("promiseTask", function () {
	return taskModuleMap[this].promiseTask;
});

String.prototype.__defineGetter__("deadTask", function () {
	return taskModuleMap[this].deadTask;
});

String.prototype.make = function (...args) {
	return taskModuleMap[this].make(...args);
};

String.prototype.makeAnyway = function (...args) {
	return taskModuleMap[this].makeAnyway(...args);
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

String.prototype.memoize = function () {
	return taskModuleMap[this].memoize();
};

//** array prototype

const getArrayTask = (arr, errFuncName) => {
	if (arr.length === 0)
		return new MereTask(() => {});

	let finalTask = typeof arr[0] === "string" ? taskModuleMap[arr[0]] : arr[0];

	if (finalTask && finalTask.constructor && finalTask.constructor.name === "Array")
		finalTask = getArrayTask(finalTask);

	if (!finalTask || !finalTask.constructor || finalTask.constructor.name !== "MereTask")
		throw new Error(`array must contain only tasks to call ${errFuncName}`);

	for (let i = 1; i < arr.length; i += 1) {
		const curTask = typeof arr[i] === "string" ? taskModuleMap[arr[i]] : arr[i];

		if (!curTask || !curTask.constructor || curTask.constructor.name !== "MereTask")
			throw new Error(`array must contain only tasks to call ${errFuncName}`);

		finalTask = finalTask.then(arr[i]);
	}

	return finalTask;
};

Array.prototype.__defineGetter__("task", function () {
	return getArrayTask(this, "to the task property");
});

Array.prototype.__defineGetter__("frozenTask", function () {
	return getArrayTask(this, "to the frozenTask property").frozenTask;
});

Array.prototype.__defineGetter__("promiseTask", function () {
	return getArrayTask(this, "to the promiseTask property").promiseTask;
});

Array.prototype.__defineGetter__("deadTask", function () {
	return getArrayTask(this, "to the deadTask property").deadTask;
});

Array.prototype.make = function (...args) {
	if (this.length !== 0)
		return getArrayTask(this, "make()").make(...args);

	return undefined;
};

Array.prototype.makeAnyway = function (...args) {
	if (this.length !== 0)
		return getArrayTask(this, "make()").makeAnyway(...args);

	return undefined;
};

Array.prototype.promise = function (...args) {
	if (this.length !== 0)
		return getArrayTask(this, "promise()").promise(...args);

	return new Promise((resolve) => {
		resolve();
	});
};

Array.prototype.generate = function (passArgs = false) {
	for (const task of this)
		if (!isTask(task))
			throw new Error("array must contain only tasks to call generate()");

	const gen = (function *(arr) {

		/* eslint-disable no-undef-init */

		let res = undefined;

		/* eslint-enable no-undef-init */

		if (passArgs)
			for (const task of arr) {
				if (res === undefined)
					res = task.makeAnyway(...wrapInArr(yield));
				else if (isPromise(res)) {
					const args = yield res;

					res = res.then(
						(nextRes) => {
							if (nextRes === undefined)
								return task.makeAnyway(...wrapInArr(args));

							return task.makeAnyway(nextRes, ...wrapInArr(args));
						},
						(err) => {
							throw err;
						});
				} else
					res = task.makeAnyway(res, ...wrapInArr(yield res));
			}
		else
			for (const task of arr)
				res = task.makeAnyway(...wrapInArr(yield res));

		return res;
	}(this));

	gen.next();

	return gen;
};

Array.prototype.with = function (...args) {
	return getArrayTask(this, "with()").with(...args);
};

Array.prototype.then_ = function (task, ...args) {
	return getArrayTask(this, "then()").then(task, ...args);
};

Array.prototype.memoize = function () {
	return getArrayTask(this, "memoize()").memoize();
};

/**
 * Exports.
 */
exports = module.exports = {
	NO_CHECK   : config.ARG_CHECK_ENUM.NO_CHECK,
	NOT_MORE   : config.ARG_CHECK_ENUM.NOT_MORE,
	NOT_LESS   : config.ARG_CHECK_ENUM.NOT_LESS,
	MUST_EQUAL : config.ARG_CHECK_ENUM.MUST_EQUAL,
	DEFAULT    : config.DEFAULT,
	config     : config.config,
	clearTasks : () => {
		taskModuleMap = {};
	}
};