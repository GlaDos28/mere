/****************************
 * Launcher and the only module. Remakes String prototype and keeps all the generators.
 *
 * @author Evgeny Savelyev
 * @since 29.01.17
 ****************************/

"use strict";

/**
 * Constants.
 */
const taskModuleMap = {};

String.prototype.bind = function (func) {
	taskModuleMap[this] = func;
};

String.prototype.make = function (...args) {
	const func = taskModuleMap[this];

	if (typeof func !== "function")
		throw new Error(`task ${this} is not binded to the function`);

	if (func.length >= args.length)
		return func(...args);

	throw new Error(`too many arguments: given ${args.length}, expected ${func.length}`);
};

String.prototype.promise = function (...args) {
	const func = taskModuleMap[this];

	if (typeof func !== "function")
		throw new Error(`task ${this} is not binded to the function`);

	if (func.length >= args.length)
		return new Promise((resolve, reject) => {
			try {
				resolve(func(...args));
			} catch (err) {
				reject(err);
			}
		});

	throw new Error(`too many arguments: given ${args.length}, expected ${func.length}`);
};

/**
 * Exports.
 */
exports = module.exports = {};