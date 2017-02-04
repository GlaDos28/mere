/****************************
 * Function that determines whether the given object is a Promise.
 *
 * @author GlaDos
 * @since 02.03.17
 ****************************/

"use strict";

/**
 * Determines whether the given object is a Promise.
 *
 * @param {Object} obj object to check
 * @return {Boolean} decision
 */
exports = module.exports = (obj) =>
	obj                              &&
		obj.then instanceof Function &&
		!(obj instanceof Array)      &&
		typeof obj !== "string"      &&
		!(obj instanceof require("../MereTask")); /* Can not be required at once because of a cycle dependence */