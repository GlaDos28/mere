/****************************
 * Function that returns formal arguments of the given function.
 *
 * @author GlaDos
 * @since 03.02.17
 ****************************/

"use strict";

/**
 * Argument delimiters.
 *
 * @type {Array}
 */
const delimiters = [" ", ",", "\n", "\t"];

/**
 * Returns formal arguments of the given function.
 * If function has 'rest' argument, then there is null value put in the end of the result array.
 *
 * @param {Function} func the function to get formal arguments of
 * @return {Array} formal argument names array
 */
exports = module.exports = (func) => {
	const
		funcStr = func.toString(),
		args    = [];

	let
		ind     = funcStr.indexOf("(") + 1,
		hasRest = false;

	for (;;) {
		for (let i = 0; i < delimiters.length; i += 1)
			if (funcStr.charAt(ind) === delimiters[i]) {
				ind += 1;
				i = -1;
			}

		if (funcStr.charAt(ind) === ")") {
			if (hasRest)
				args.push(null);

			return args;
		}

		if (funcStr.charAt(ind) === ".") {
			hasRest = true;
			ind += "...".length;
		} else {
			let arg   = "";

			for (;;) {
				arg += funcStr.charAt(ind);

				ind += 1;

				if (funcStr.charAt(ind) === ")") {
					args.push(arg);

					if (hasRest)
						args.push(null);

					return args;
				}

				let isDel = false;

				for (let i = 0; i < delimiters.length; i += 1)
					if (funcStr.charAt(ind) === delimiters[i]) {
						isDel = true;
						break;
					}

				if (isDel) {
					args.push(arg);
					break;
				}
			}
		}
	}
};