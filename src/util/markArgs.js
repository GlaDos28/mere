/****************************
 * Function that wraps arguments that must be transformed.
 *
 * @author GlaDos
 * @since 05.03.17
 ****************************/

"use strict";

/**
 * Wrapper structure.
 *
 * @typedef {Object} TransArg
 * @property {Boolean} __mereTransformIndicator indicator
 * @property {Object} obj wrapping object
 */

/**
 * Wraps arguments that must be transformed.
 *
 * @param {Array<Object>} objs array pf objects to wrap
 * @return {Array<TransArg>} wrapped object array
 */
exports = module.exports = (objs) => {
	const res = [];

	for (let i = 0; i < objs.length; i += 1)
		res.push({
			__mereTransformIndicator : true,
			obj : objs[i]
		});

	return res;
};