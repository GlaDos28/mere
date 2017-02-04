/****************************
 * Function that wraps the given task in task array or returns the object if it is already the array.
 *
 * @author GlaDos
 * @since 30.01.17
 ****************************/

"use strict";

/**
 * Wraps the given task in array or returns the object if it is already the array.
 * In fact, works with all object types, but the function is designed for only tasks and arrays.
 *
 * @param {MereTask|Array} obj Mere task or Mere task array
 * @return {Array} Mere task array
 */
exports = module.exports = (obj) => {
	if (obj && obj.constructor && obj.constructor.name === "Array")
		return obj;

	if (obj === undefined)
		return [];

	return [obj];
};