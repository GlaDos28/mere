/****************************
 * Mere task implementation. The core of the task logic.
 *
 * @author GlaDos
 * @since 29.01.17
 ****************************/

"use strict";

/**
 * Imports.
 */
const
	ensureArgNum          = require("./util/ensureArgNum"),
	execFunc              = require("./util/execFunc"),
	getArgDict            = require("./util/getArgDict"),
	getArgNum             = require("./util/getArgNum"),
	getFunctionFormalArgs = require("./util/getFunctionFormalArgs"),
	isPromise             = require("./util/isPromise"),
	markArgs              = require("./util/markArgs"),
	preProcess            = require("./util/preProcess"),
	transformArgs         = require("./util/transformArgs"),
	config                = require("./configuration");

/* eslint-disable no-param-reassign */

/**
 * The task that can be executed.
 *
 * @property {MereTask} task link to itself
 * @property {MereTask} frozenTask 'frozen' link to itself (returns itself when executed)
 * @property {Function} func executive function
 * @property {Array<String>} formalArgs formal arguments
 * @property {Object} memo memoization data
 */
class MereTask {
	constructor (func, formalArgs) {
		this.__defineGetter__("task",        () => this);
		this.__defineGetter__("frozenTask",  () => new MereTask(() => this, []));
		this.__defineGetter__("promiseTask", () => new MereTask((...argsP) =>
			new Promise((resolve, reject) => {
				try {
					resolve(execFunc(this, ...argsP));
				} catch (err) {
					reject(err);
				}
			}), formalArgs));
		this.__defineGetter__("deadTask",    () => new MereTask((...args) => {
			const res = execFunc(this, ...args);

			if (isPromise(res))
				return res.then(() => {});

			return undefined;
		}, formalArgs));

		this.func       = func;
		this.formalArgs = formalArgs || getFunctionFormalArgs(func);
		this.memo       = null; /* null means no memo (by default) */
	}

	make (...args) {
		args = preProcess(this, args);

		const res = execFunc(this, ...markArgs(args));

		if (!config.config.isMakeReturnPromiseAllowed() && res instanceof Promise)
			throw new Error("make() should not return a promise");

		return res;
	}

	makeAnyway (...args) {
		return execFunc(this, ...markArgs(preProcess(this, args)));
	}

	promise (...args) {
		args = preProcess(this, args);

		return new Promise((resolve, reject) => {
			try {
				resolve(execFunc(this, ...markArgs(args)));
			} catch (err) {
				reject(err);
			}
		});
	}

	with (...args) {
		const formalArgNum = getArgNum(this);
		let   trueArgs     = getArgDict(this.formalArgs, args);

		if (trueArgs !== null) {
			trueArgs = markArgs(trueArgs);

			if (formalArgNum.hasRest && formalArgNum.num === 0)
				return new MereTask(this.func.bind(undefined, ...transformArgs(trueArgs)), this.formalArgs);

			const
				skipArgInds  = [],
				skipArgNames = [];

			for (let i = 0; i < formalArgNum.num; i += 1)
				if (trueArgs[i] === undefined || trueArgs[i].obj === undefined) {
					skipArgInds.push(i);
					skipArgNames.push(this.formalArgs[i]);
				}

			if (formalArgNum.hasRest) {
				skipArgNames.push(this.formalArgs[formalArgNum.num]);
				skipArgNames.push(null);
			}

			return new MereTask(
				(...lastArgs) => {
					const limit = Math.min(lastArgs.length, skipArgInds.length);

					for (let i = 0; i < limit; i += 1)
						trueArgs[skipArgInds[i]] = lastArgs[i];

					for (let i = limit; i < lastArgs.length; i += 1)
						trueArgs.push(lastArgs[i]);

					execFunc(this, ...trueArgs);
				},
				skipArgNames
			);
		}

		args = markArgs(args);

		if (formalArgNum.hasRest && formalArgNum.num === 0) {
			return new MereTask(this.func.bind(undefined, ...transformArgs(args)), this.formalArgs);
		}

		if (!config.config.isMoreArgAllowed() && !formalArgNum.hasRest && args.length > formalArgNum.num)
			throw new Error(`too many arguments: given ${args.length}, expected ${formalArgNum}`);

		let sliceStart = args.length;

		if (formalArgNum.hasRest && args.length > formalArgNum.num)
			sliceStart = formalArgNum.num;

		return new MereTask(
			(...lastArgs) => execFunc(this, ...args, ...lastArgs),
			this.formalArgs.slice(sliceStart, this.formalArgs.length)
		);
	}

	then (task, ...secondArgs) {
		if (!task)
			throw new Error(`task expected, got ${task}`);

		const trueTask = task.task;

		if (!trueTask)
			throw new Error(`task expected, got ${trueTask}`);

		try {
			ensureArgNum(secondArgs.length, getArgNum(trueTask));
		} catch (_) {
			ensureArgNum(secondArgs.length + 1, getArgNum(trueTask));
		}

		secondArgs = markArgs(secondArgs);

		return new MereTask((...args) => {
			const firstRes = execFunc(this, ...args);

			if (isPromise(firstRes))
				return new Promise((resolve, reject) =>
					firstRes.then(
						(firstTrueRes) => {
							resolve(firstTrueRes === undefined
								? execFunc(trueTask, ...secondArgs)
								: execFunc(trueTask, ...markArgs([firstTrueRes]), ...secondArgs));
						},
						(err) => {
							reject(err);
						}
					));

			return firstRes === undefined
					? execFunc(trueTask, ...secondArgs)
					: execFunc(trueTask, ...markArgs([firstRes]), ...secondArgs);
		},
			this.formalArgs
		);
	}

	memoize () {
		if (this.memo === null)
			this.memo = {};
	}
}

/**
 * Exports.
 */
exports = module.exports = MereTask;