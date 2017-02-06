/****************************
 * Mere configuration. Is a singleton object.
 *
 * @author GlaDos
 * @since 30.01.17
 ****************************/

"use strict";

/**
 * Argument checking types.
 */
const ARG_CHECK_ENUM = {
	NO_CHECK   : 0,
	NOT_MORE   : 1,
	NOT_LESS   : 2,
	MUST_EQUAL : 3
};

/**
 * Default parameters.
 *
 * @property {Number} ARG_CHECK default value that determines lessArgAllowed and moreArgAllowed values
 * @property {Boolean} MAKE_RETURN_PROMISE_ALLOWED default makeReturnPromiseAllowed value
 */
const DEFAULT = {
	ARG_CHECK                   : ARG_CHECK_ENUM.NOT_MORE,
	MAKE_RETURN_PROMISE_ALLOWED : true
};

/**
 * Mere configuration definition.
 *
 * @property {Boolean} lessArgAllowed whether it is allowed to use less actual arguments than formal
 * @property {Boolean} moreArgAllowed whether it is allowed to use more actual arguments than formal
 * @property {Boolean} makeReturnPromiseAllowed whether it is allowed for make command to return a promise
 */
class MereConfiguration {
	constructor (argCheck, makeReturnPromiseAllowed) {
		this.lessArgAllowed           = null;
		this.moreArgAllowed           = null;
		this.makeReturnPromiseAllowed = null;

		this.setArgCheck(argCheck);
		this.setMakeReturnPromiseAllowed(makeReturnPromiseAllowed);
	}

	getArgCheck () {
		if (this.lessArgAllowed && this.moreArgAllowed)
			return ARG_CHECK_ENUM.NO_CHECK;

		if (this.lessArgAllowed)
			return ARG_CHECK_ENUM.NOT_MORE;

		if (this.moreArgAllowed)
			return ARG_CHECK_ENUM.NOT_LESS;

		return ARG_CHECK_ENUM.MUST_EQUAL;
	}

	isMoreArgAllowed () {
		return this.moreArgAllowed;
	}

	isLessArgAllowed () {
		return this.lessArgAllowed;
	}

	setArgCheck (type) {
		switch (type) {
		case ARG_CHECK_ENUM.NO_CHECK:
			this.lessArgAllowed = true;
			this.moreArgAllowed = true;
			break;
		case ARG_CHECK_ENUM.NOT_LESS:
			this.lessArgAllowed = false;
			this.moreArgAllowed = true;
			break;
		case ARG_CHECK_ENUM.NOT_MORE:
			this.lessArgAllowed = true;
			this.moreArgAllowed = false;
			break;
		case ARG_CHECK_ENUM.MUST_EQUAL:
			this.lessArgAllowed = false;
			this.moreArgAllowed = false;
			break;
		default:
			throw new Error(`invalid argument checking type: ${type} (use mere.ARG_CHECK_ENUM)`);
		}
	}

	isMakeReturnPromiseAllowed () {
		return this.makeReturnPromiseAllowed;
	}

	setMakeReturnPromiseAllowed (option) {
		this.makeReturnPromiseAllowed = option;
	}
}

/**
 * The configuration itself. Is a singleton object.
 *
 * @type {MereConfiguration}
 */
const config = new MereConfiguration(DEFAULT.ARG_CHECK, DEFAULT.MAKE_RETURN_PROMISE_ALLOWED);

/**
 * Exports.
 */
exports = module.exports = {
	ARG_CHECK_ENUM : ARG_CHECK_ENUM,
	DEFAULT        : DEFAULT,
	config         : config
};