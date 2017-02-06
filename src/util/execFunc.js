/****************************
 * Function that executes Mere task's kept function.
 *
 * @author GlaDos
 * @since 29.01.17
 ****************************/

"use strict";

/**
 * Imports.
 */
const
	getArgNum     = require("./getArgNum"),
	isPromise     = require("./isPromise"),
	transformArgs = require("./transformArgs");

const finalExec = (task, finalArgs, argNum, argLimit) => {
	if (!argNum.hasRest) { /* memoization does not work with a 'rest' parameter */
		for (let i = argLimit; i < argNum.num; i += 1)
			finalArgs.push(undefined);

		if (task.memo !== null) {
			const argsKey = JSON.stringify(finalArgs); /* => memoization works with serializable arguments only */

			if (task.memo[argsKey] !== undefined)
				return task.memo[argsKey];

			const res = task.func(...finalArgs);

			task.memo[argsKey] = res;
			return res;
		}
	}

	return task.func(...finalArgs);
};

/**
 * Executes Mere task's kept function.
 *
 * @param {MereTask} task to be executed. Must be a real Mere task, not its relative string or etc.
 * @param {Boolean} notTransformArgs whether not to transform then given arguments
 * @param {Array<Object|TransArg>} args argument array. Arguments can be Mere tasks, then they will be executed by make() command
 * @return {Object|Promise} execution result
 */
exports = module.exports = (task, ...args) => {
	const
		argNum   = getArgNum(task),
		argLimit = argNum.hasRest ? args.length : Math.min(args.length, argNum.num),
		trueArgs = transformArgs(args, argLimit);

	if (isPromise(trueArgs))
		return trueArgs.then((truestArgs) =>
			finalExec(task, truestArgs, argNum, argLimit));

	return finalExec(task, trueArgs, argNum, argLimit);
};