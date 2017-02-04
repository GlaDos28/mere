/****************************
 * Function that ensures that the given argument number meets the requirements defined in Mere configuration.
 *
 * @author GlaDos
 * @since 29.01.17
 ****************************/

"use strict";

/**
 * Imports.
 */
const config = require("../configuration");

/**
 * Ensures that the given argument number meets the requirements defined in Mere configuration.
 *
 * @param {Number} given number of arguments that is given
 * @param {ArgNum} expected number of arguments that is expected
 * @return {void} nothing, but can throw errors
 */
exports = module.exports = (given, expected) => {
	if (!config.config.isLessArgAllowed() && given < expected.num)
		throw new Error(`too few arguments: given ${given}, minimal is ${expected.num}`);

	if (!config.config.isMoreArgAllowed() && given > expected.num && !expected.hasRest)
		throw new Error(`too many arguments: given ${given}, maximum is ${expected.num}`);
};