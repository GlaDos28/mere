# "Mere" - library for JavaScript

Library that allows to bind functions to the string-formed tasks (JavaScript's Strings) and then execute function through its related task.

### Installation

```
npm i mere --save
```

### Usage

Bind a function to the string-formed task:

```javascript
"task name".bind((arg1, arg2, ...) => {
	/* some logic */
});
```

Execute a function:

```javascript
const res = "task name".make(arg1, arg2, ...); /* may throw Errors! */
```

Return a function wrapped in promise:

```javascript
const promise = "task name".promise(arg1, arg2, ...); /* errors will call the promise's reject branch! */
```

### Examples

##### Hello-world

```javascript
require("mere");

"say hello-world".bind(() => {
	console.log("Hello, world!");
});

"say hello-world".make();
```

##### Sum two numbers

```javascript
"sum".bind((num1, num2) => {
	return num1 + num2;
});

console.log("sum".make(2, 3));

"sum".promise(2, 3).then(
	(res) => {
    	console.log(res);
    },
    (error) => {
		console.log("That is impossible!");
    });
```

##### Fibonacci

```javascript
"fib".bind((k) => {
	if (k <= 2)
		return 1;
	else
		return "fib".make(k - 1) + "fib".make(k - 2);
});

console.log("fib".make(5));
```

### Future releases

- optional functions' memoization.