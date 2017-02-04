/****************************
 * Function that returns a structure with a task argument number and rest parameter (boolean) indicator.
 *
 * @author GlaDos
 * @since 04.02.17
 ****************************/

"use strict";

/**
 * @typedef {Object} ArgNum argument number structure
 *
 * @property {Number} num formal argument number
 * @property {Boolean} hasRest whether the rest property appears in the formal arguments
 */

/**
 * Returns a structure with a task argument number and rest parameter (boolean) indicator.
 *
 * @param {MereTask} task Mere task to get formal argument number of
 * @return {ArgNum} structure that contains formal argument number and rest parameter indicator
 */
exports = module.exports = (task) => {
	if (task.formalArgs.length > 0 && task.formalArgs[task.formalArgs.length - 1] === null)
		return {
			num     : task.formalArgs.length - 2, /* -2 <= rest argument and null */
			hasRest : true
		};

	return {
		num     : task.formalArgs.length,
		hasRest : false
	};
};