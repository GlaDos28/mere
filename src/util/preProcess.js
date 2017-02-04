/****************************
 * Function for a pre-process that is called before make() and promise() methods.
 *
 * @author GlaDos
 * @since 04.02.17
 ****************************/

"use strict";

/**
 * Imports.
 */
const
	ensureArgNum = require("./ensureArgNum"),
	getArgNum    = require("./getArgNum"),
	getArgDict    = require("./getArgDict");

/* eslint-disable no-param-reassign */

/**
 * Pre-processing that is called before make() and promise() methods.
 * Returns an array of arguments that is given or array of true arguments if the given arguments is a structure with real arguments.
 *
 * @param {MereTask} task Mere task to pre-process
 * @param {Array} args argument array
 * @return {Array} true argument array
 */
exports = module.exports = (task, args) => {
	if (typeof task.func !== "function")
		throw new Error("task is not binded to the function");

	const trueArgs = getArgDict(task.formalArgs, args);

	if (trueArgs !== null)
		args = trueArgs;

	ensureArgNum(args.length, getArgNum(task));

	return args;
};