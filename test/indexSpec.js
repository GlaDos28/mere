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
	mere   = require("../index"),
	expect = require("chai").expect;

/* eslint-disable no-undef, no-magic-numbers, id-length */

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

	it("'Fibonacci with memoization' works", (done) => {
		"fib".bind((k) => {
			if (!k || k instanceof Number || k < 0)
				throw new Error("bad input");

			if (k <= 2)
				return 1;

			return "fib".make(k - 1) + "fib".make(k - 2);
		});

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
		"sum"  .bind((num1, num2) => num1 + num2);
		"print".bind((msg) => msg.toString());

		expect("sum".then("print").make(2, 2)).to.equal("4");
		expect("sum".then("sum", 10).then("print").make(-5, -5)).to.equal("0");
		"sum".then("print").promise(10, -20).then(
			(res) => {
				expect(res).to.equal("-10");
				done();
			},
			done
		);
	});

	it("'Number doubler' works", (done) => {
		"mult"  .bind((num1, num2) => num1 * num2);
		"double".bind("mult".with(2));

		expect("double".make(2)).to.equal(4);
		expect("double".make("double".with(2))).to.equal(8);
		expect("double".then("double").make(-2)).to.equal(-8);
		expect("double".then("double".then("double")).with(-2).make()).to.equal(-16);
		"double".then("double".then("double")).promise(2).then(
			(res) => {
				expect(res).to.equal(16);
				done();
			},
			done
		);
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
					mere.config.setMakeReturnPromiseAllowed(false);
					expect(strings[0]).to.be.equal(str);
					expect(strings[1]).to.be.equal("who I am");
					done();
				},
				(err) => {
					mere.config.setMakeReturnPromiseAllowed(false);
					done(err);
				}
			).catch(done);
		}
	});

	it("'Some arithmetic' works", () => {
		"sum" .bind((num1, num2) => num1 + num2);
		"mult".bind((num1, num2) => num1 * num2);

		expect(["sum", "mult".with(2)].make(2, 2)).to.equal(8);
		expect(["sum", "mult".with(2)].then_("sum".with(2)).make(2, 2)).to.equal(10);
		expect(["sum", "mult".with(2)].with(-3).then("sum".with(2)).make(2)).to.equal(0);
		expect([["sum", "sum".with(10)], "mult".with(2)].with(-3).then("sum".with(2)).make(2)).to.equal(20);
	});

	it("'Sum generators' works", () => {
		"sum".bind((num1, num2) => num1 + num2);

		let gen = ["sum", "sum"].generate();

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
});


/**
 * Exports.
 */
exports = module.exports = {};