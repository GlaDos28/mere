/****************************
 * Function that transforms the given arguments to the real arguments:
 * for each argument, whether it is a task, it is executed recursively.
 *
 * @author GlaDos
 * @since 04.02.17
 ****************************/

"use strict";

/**
 * Imports.
 */
const isPromise = require("./isPromise");

/**
 * Transforms the given arguments to the real arguments:
 * for each argument, whether it is wrapped and inside it is a task, it will be executed recursively.
 *
 * @param {Array<Object|TransArg>} args argument array to transform
 * @param {Number} argLimit argument limit index to transform
 * @param {Array<Object>} extraArgs arguments to put before given without transformation
 * @return {Array<Object>|Promise} transformed argument array
 */
const transformArgs = (args, argLimit = args.length, extraArgs = []) => {
	const
		trueArgs     = [],
		trueArgLimit = argLimit;

	for (let i = 0; i < trueArgLimit; i += 1) {
		if (!args[i] || args[i].__mereTransformIndicator !== true)
			trueArgs.push(args[i]);
		else {
			const arg = args[i].obj;

			if (arg && arg.constructor && arg.constructor.name === "MereTask") {
				const argRes = arg.makeAnyway();

				if (isPromise(argRes))
					return argRes.then((trueArgRes) => {
						trueArgs.push(trueArgRes);

						return transformArgs(args.slice(i + 1), trueArgLimit - i - 1, trueArgs);
					});

				trueArgs.push(argRes);
			} else
				trueArgs.push(arg);
		}
	}

	return extraArgs.concat(trueArgs);
};

/**
 * Transforms the given arguments to the real arguments:
 * for each argument, whether it is a task, it is executed recursively.
 *
 * @param {Array<Object>} args argument array to transform
 * @param {Number} argLimit argument limit index to transform
 * @return {Array<Object>|Promise} transformed argument array
 */
exports = module.exports = transformArgs;