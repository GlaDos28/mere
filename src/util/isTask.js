/****************************
 * Function that determines whether the given object is a Mere task.
 *
 * @author GlaDos
 * @since 01.03.17
 ****************************/

"use strict";

/**
 * Determines whether the given object is a Mere task.
 *
 * @param {Object} obj object to check
 * @return {Boolean} decision
 */
exports = module.exports = (obj) => {
	if (!obj)
		return false;

	const task = obj.task;

	return task && task.constructor && task.constructor.name === "MereTask";
};