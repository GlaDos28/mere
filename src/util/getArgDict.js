/****************************
 * Function that checks whether the given argument array is a non-empty dictionary of arguments
 * and returns linearized arguments in the 'true' case and null otherwise.
 *
 * @author GlaDos
 * @since 04.02.17
 ****************************/

"use strict";

/* eslint-disable no-prototype-builtins, no-magic-numbers */

/**
 * Checks whether the given argument array is a non-empty dictionary of arguments
 * and returns linearized arguments in the 'true' case and null otherwise.
 *
 * @param {Array<String>} formalArgs formal arguments
 * @param {Array<Object>} args argument array
 * @return {Array<Object>|null} linearized arguments or null instead
 */
exports = module.exports = (formalArgs, args) => {
	if (args.length === 1 && args[0] && args[0].constructor === Object && Object.keys(args[0]).length > 0) {
		const
			trueArgs = [],
			argDict  = args[0];

		for (const trueArg in argDict)
			if (argDict.hasOwnProperty(trueArg)) {
				const ind = formalArgs.indexOf(trueArg);

				if (ind > -1) {
					if (formalArgs[formalArgs.length - 1] === null && ind === formalArgs.length - 2) {
						if (!(argDict[trueArg] instanceof Array))
							return null;

						for (let i = 0; i < argDict[trueArg].length; i += 1)
							trueArgs[ind + i] = argDict[trueArg][i];
					} else
						trueArgs[ind] = argDict[trueArg];
				} else
					return null;

			} else
				return null;

		return trueArgs;
	}

	return null;
};