/* eslint-disable max-lines, max-statements, no-undef, no-magic-numbers, id-length, no-empty */

/****************************
 * index.js tests.
 *
 * @author GlaDos
 * @since 04.02.17
 ****************************/

"use strict";

/**
 * Imports.
 */
const
	mere     = require("../index"),
	expect   = require("chai").expect;

describe("Example", () => {
	before((done) => {
		mere.config.setArgCheck(mere.MUST_EQUAL);
		mere.config.setMakeReturnPromiseAllowed(false);
		done();
	});

	afterEach((done) => {
		mere.clearTasks();
		done();
	});

	it("'Hello-world' works", () => {
		let isError = false;

		try {
			"".bind(() => {});
			"".task.func = null;
			"".make();
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		try {
			"".bind(-1);
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		try {
			"".bind(null);
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		"say hello-world".bind(() => "Hello, world!");
		expect("say hello-world".make()).to.equal("Hello, world!");
	});

	it("'Sum two numbers' works", (done) => {
		"sum".bind((num1, num2) => num1 + num2);

		expect("sum".make(2, 3)).to.equal(5);

		"sum".promise(2, 3).then(
			(res) => {
				expect(res).to.equal(5);
				done();
			},
			(err) => {
				done(err);
			});
	});

	it("'Checking on being a task' works", () => {
		"is task".bind((/* */obj/* */) => {
			if (obj && obj.constructor && obj.constructor.name === "MereTask")
				return true;

			return false;
		});
		"test task".bind(() => {});

		expect("is task".make("test task".task)).to.equal(false);
		expect("is task".make("test task".frozenTask)).to.equal(true);
	});

	it("'Fibonacci with memoization' works", (done) => {
		"fib".bind((k) => {
			if (!k || k instanceof Number || k < 0)
				throw new Error("bad input");

			if (k <= 2)
				return 1;

			return "fib".make(k - 1) + "fib".make(k - 2);
		});

		"fib".memoize();
		"fib".memoize();

		expect("fib".make(1)).to.equal(1);
		expect("fib".make(50)).to.equal(12586269025);

		"fib".promise(0)
			.then(
				() => {
					done("incorrect behavior");
				},
				() => "fib".promise("qwerty"))
			.then(
				() => {
					done("incorrect behavior");
				},
				() => {
					done();
				});
	});

	it("'Sum and call' works", (done) => {
		"sum"  .bind((num1, num2) => {
			if (typeof num1 !== "number" || typeof num2 !== "number")
				throw new Error("bad input");

			return num1 + num2;
		});
		"print".bind((msg) => msg.toString());

		let isError = false;

		try {
			"sum".then(null);
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		try {
			"sum".then(2);
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		expect("sum".then("print").make(2, 2)).to.equal("4");
		expect("sum".then("sum", 10).then("print").make(-5, -5)).to.equal("0");

		"sum".promiseTask.then("print").promise(10, -20)
			.then(
				(res) => {
					expect(res).to.equal("-10");
					return "sum".promiseTask.then("print").makeAnyway("bad", "input");
				},
				done)
			.then(
				() => {
					throw new Error("incorrect result");
				},
				() => "print".promiseTask.deadTask.then("print".deadTask, "hello").makeAnyway("world"))
			.then(
				done,
				() => {
					throw new Error("incorrect result");
				});
	});

	it("'Number doubler' works", (done) => {
		"mult"  .bind((num1, num2) => num1 * num2);
		"double".bind("mult".with(2));

		expect("double".make(2)).to.equal(4);
		expect("double".make("double".with(2))).to.equal(8);
		expect("double".then("double").make(-2)).to.equal(-8);
		expect("double".then("double".then("double")).with(-2).make()).to.equal(-16);

		let isError = false;

		try {
			"double".with(3, 3);
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		"double".then("double".then("double")).promise(2)
			.then(
				(res) => {
					expect(res).to.equal(16);
					done();
				},
				done);
	});

	it("'Faggot thrower' works", (done) => {
		const str = "you are a faggot";

		"upper case".bind((msg) => msg.toUpperCase());

		"who I am".bind(() => str);

		expect("upper case".make("who I am".task)).to.equal(str.toUpperCase());
		expect("upper case".make("who I am".make())).to.equal(str.toUpperCase());
		expect("who I am".then("upper case").make()).to.equal(str.toUpperCase());

		"promisify".bind((...args) => new Promise((resolve) => {
			resolve(args);
		}));


		try {
			"promisify".make().then(() => {
				done(new Error("incorrect result"));
			}, () => {
				done(new Error("incorrect result"));
			});
		} catch (_) {
			mere.config.setMakeReturnPromiseAllowed(true);

			"promisify".with("who I am".task, "who I am").make().then(
				(strings) => {
					expect(strings[0]).to.be.equal(str);
					expect(strings[1]).to.be.equal("who I am");
					done();
				},
				(err) => {
					done(err);
				}
			).catch(done);
		}
	});

	it("'Array checks' works", (done) => {
		let isError = false;

		try {
			["no such task"].make();
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		"some task".bind(() => {});

		try {
			["some task", "no such task"].make();
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		expect([].with().make()).to.equal(undefined);

		"is task".bind((obj) => {
			if (obj && obj.constructor && obj.constructor.name === "MereTask")
				return true;

			return false;
		});

		expect("is task".make([].task)).to.equal(false);
		expect("is task".make([].frozenTask)).to.equal(true);

		expect([].make()).to.equal(undefined);
		expect([].then_([]).make()).to.equal(undefined);

		"double".bind((num) => num * 2);

		const quadruple = ["double", "double"];

		quadruple.memoize();

		expect(quadruple.make(2)).to.equal(8);
		expect(quadruple.make(2)).to.equal(8);

		"resolve promise".bind(() => new Promise((resolve) => {
			resolve(1);
		}));

		"reject promise".bind(() => new Promise((_, reject) => {
			reject(-1);
		}));

		"empty resolve promise".bind(() => new Promise((resolve) => {
			resolve();
		}));

		expect([].makeAnyway()).to.equal(undefined);
		expect(["resolve promise"].makeAnyway() instanceof Promise).to.equal(true);

		expect([].promise() instanceof Promise).to.equal(true);
		expect(["resolve promise"].promise() instanceof Promise).to.equal(true);

		const promiseTaskArr = ["empty resolve promise", "resolve promise", "reject promise", "resolve promise"].generate(true);

		mere.config.setArgCheck(mere.NO_CHECK);

		promiseTaskArr.next().value
			.then(
				(data) => {
					expect(data).to.equal(undefined);
					return promiseTaskArr.next().value;
				},
				() => {
					throw new Error("incorrect result");
				})
			.then(
				(data) => {
					expect(data).to.equal(1);
					return promiseTaskArr.next().value;
				},
				() => {
					throw new Error("incorrect result");
				})
			.then(
				() => {
					throw new Error("incorrect result");
				},
				(data) => {
					expect(data).to.equal(-1);
					return promiseTaskArr.next().value;
				})
			.then(
				() => {
					throw new Error("incorrect result");
				},
				(data) => {
					expect(data).to.equal(-1);
					done();
				});
	});

	it("'Some arithmetic' works", () => {
		let isError = false;

		try {
			[null].generate();
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		"sum" .bind((num1, num2) => num1 + num2);
		"mult".bind((num1, num2) => num1 * num2);

		"task array".bind(["sum", "mult".with(2)]);

		expect("task array".make(2, 2)).to.equal(8);
		expect("task array".then("sum".with(2)).make(2, 2)).to.equal(10);
		expect("task array".with(-3).then("sum".with(2)).make(2)).to.equal(0);
		expect([["sum", "sum".with(10)], "mult".with(2)].with(-3).then("sum".with(2)).make(2)).to.equal(20);
	});

	it("'Sum generators' works", () => {
		mere.config.setArgCheck(mere.NO_CHECK);

		"sum".bind((num1, num2) => num1 + num2);

		let gen = ["sum"].generate();

		expect(isNaN(gen.next().value)).to.equal(true);

		gen = ["sum", "sum"].generate();

		expect(gen.next([2, 3]).value).to.equal(5);
		expect(gen.next([20, 30]).value).to.equal(50);

		gen = ["sum", "sum"].generate(true);

		expect(gen.next([2, 3]).value).to.equal(5);
		expect(gen.next(20).value).to.equal(25);
	});

	it("'Printing five messages with partial argument filling' works", () => {
		"print 5 messages".bind((m1, m2, m3, m4, m5) => {
			expect(m1).to.equal("Hello,");
			expect(m2).to.equal("this");
			expect(m3).to.equal("is");
			expect(m4).to.equal("five");
			expect(m5).to.equal("lines");
		});

		"print 5 messages"
			.with({
				m1 : "Hello,",
				m4 : "five",
				m3 : "is"
			})
			.with({ m5 : "lines" })
			.make({ m2 : "this" });

		"print at least two messages".bind((msg1, msg2, ...msgs) => {
			expect(msg1).not.to.be.an("undefined");
			expect(msg2).not.to.be.an("undefined");
			expect(msgs instanceof Array).to.equal(true);
		});

		"print at least two messages".with({ msg1 : "test" }).with("msg2", "msg3").make("msg4");
	});

	it("'Infinity adder' works", () => {
		"adder".bind((...summands) => {
			let res = 0;

			for (let i = 0; i < summands.length; i += 1)
				res += summands[i];

			return res;
		});

		let task = "adder";

		for (let i = 0; i < 1000; i += 1)
			task = task.with(1, 1);

		expect(task.make()).to.equal(2000);

		task = "adder";

		for (let i = 0; i < 1000; i += 1)
			task = task.with({ summands : [1, 1] });

		expect(task.make()).to.equal(2000);
	});

	it("'Force a promise return' works", (done) => {
		"promisify".bind((func, ...args) =>
			new Promise((resolve, reject) => {
				try {
					resolve(func(...args));
				} catch (err) {
					reject(err);
				}
			}));

		"promisify".makeAnyway((num1, num2) => num1 + num2, 2, 2).then(
			(res) => {
				expect(res).to.equal(4);
				done();
			},
			done
		);
	});

	it("'Not more argument checking' works", (done) => {
		mere.config.setArgCheck(mere.NOT_MORE);

		"take 2 args".bind((arg1, arg2) => {}).promise(null)
			.then(
				() => "take 2 args".promise(null, null, null),
				done)
			.then(
				() => {
					done(new Error("incorrect result"));
				},
				() => {
					done();
				});
	});

	it("'Not less argument checking' works", (done) => {
		mere.config.setArgCheck(mere.NOT_LESS);

		"take 2 args".bind((arg1, arg2) => {}).promise(null, null, null)
			.then(
				() => "take 2 args".promise(null),
				done)
			.then(
				() => {
					done(new Error("incorrect result"));
				},
				() => {
					done();
				});
	});

	it("'Argument dictionary with rest parameter' works", () => {
		mere.config.setArgCheck(mere.NO_CHECK);

		"args return".bind((...args ) => args);

		let tmpRes = "args return".make({ args : [1] });

		expect(tmpRes.length).to.equal(1);
		expect(tmpRes[0]).to.equal(1);

		tmpRes = "args return".make({ args : 1 });

		expect(tmpRes.length).to.equal(1);
		expect(tmpRes[0]).not.to.be.an("undefined");
		expect(Object.keys(tmpRes[0]).length).to.equal(1);
		expect(tmpRes[0].args).to.equal(1);

		"second arg return".bind((arg1, arg2) => arg2);

		expect("second arg return".make({
			arg1 : 10,
			arg2 : 20
		})).to.equal(20);

		expect("second arg return".make({
			arg1 : 10,
			arg3 : 20
		})).to.equal(undefined);

		expect("second arg return".make({
			arg1      : 10,
			__proto__ : { arg2 : 20 }
		})).to.equal(undefined);
	});

	it("'Get configuration argument checking' works", () => {
		mere.config.setArgCheck(mere.NO_CHECK);
		expect(mere.config.getArgCheck()).to.equal(mere.NO_CHECK);

		mere.config.setArgCheck(mere.NOT_LESS);
		expect(mere.config.getArgCheck()).to.equal(mere.NOT_LESS);

		mere.config.setArgCheck(mere.NOT_MORE);
		expect(mere.config.getArgCheck()).to.equal(mere.NOT_MORE);

		mere.config.setArgCheck(mere.MUST_EQUAL);
		expect(mere.config.getArgCheck()).to.equal(mere.MUST_EQUAL);
	});

	it("'Set invalid argument checking' works", () => {
		let isError = false;

		try {
			mere.config.setArgCheck(4);
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");

		try {
			mere.config.setArgCheck("hello");
			isError = true;
		} catch (_) {}

		if (isError)
			throw new Error("incorrect result");
	});

	it("'Execute task through task's result' works", () => {
		"outer task".bind(() => "inner task".task);
		"inner task".bind(() => -1);
		"arg return".bind((arg) => arg);

		expect("outer task".then("arg return").make()).to.equal(-1);
	});

	it("'Task properties' combinations' works", (done) => {
		"is task".bind((obj) => {
			if (obj && obj.constructor && obj.constructor.name === "MereTask")
				return true;

			return false;
		});

		"is promise".bind((obj) => {
			if (obj && obj.constructor && obj.constructor.name === "Promise")
				return true;

			return false;
		});

		expect("is task".task.make("is task".frozenTask)).to.equal(true);

		"is promise".promiseTask.promise("is task".promiseTask)
			.then((data) => {
				expect(data).to.equal(false);
				return "is task".promiseTask.promise("is task".promiseTask.frozenTask);
			}).then((data) => {
				expect(data).to.equal(true);
				return "is task".deadTask.promise("is task".deadTask.frozenTask);
			}).then((data) => {
				expect(data).to.equal(undefined);
				return "is task".deadTask.task.promiseTask.makeAnyway("is task".frozenTask.deadTask);
			}).then((data) => {
				expect(data).to.equal(undefined);
				expect("is promise".frozenTask.make().task.makeAnyway([["is promise"].promiseTask].deadTask.frozenTask)).to.equal(false);
				expect("is promise".promiseTask.deadTask.makeAnyway().constructor.name).to.equal("Promise");
				done();
			}).catch(done);
	});
});


/**
 * Exports.
 */
exports = module.exports = {};