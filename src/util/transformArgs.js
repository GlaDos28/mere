/****************************
 * Function that transforms the given arguments to the real arguments:
 * for each argument, whether it is a task, it is executed recursively.
 *
 * @author GlaDos
 * @since 04.02.17
 ****************************/

"use strict";

/**
 * Transforms the given arguments to the real arguments:
 * for each argument, whether it is a task, it is executed recursively.
 *
 * @param {Array<Object>} args argument array to transform
 * @param {Number} argLimit argument limit index to transform
 * @return {Array<Object>} transformed argument array
 */
exports = module.exports = (args, argLimit) => {
	const
		trueArgs     = [],
		trueArgLimit = argLimit || args.length;

	for (let i = 0; i < trueArgLimit; i += 1)
		if (args[i] && args[i].constructor && args[i].constructor.name === "MereTask")
			trueArgs.push(args[i].make());
		else
			trueArgs.push(args[i]);

	return trueArgs;
};