<div align="center">
  <h1>for-own.macro</h1>

  A babel-macro that makes for-in only visit own properties
</div>

<hr />

## The problem

`for ... in` statements get enumerable keys from the whole prototype chain.
To prevent bugs, it is reccomented to write loops like this:
```js
for (const key in obj) {
  if (obj.hasOwnProperty(key)) {
    // "key" is a property of "obj"
  }
}
```
Pretty verbose, right?

## This solution

This is a [babel-plugin-macro](https://github.com/kentcdodds/babel-plugin-macros) which allows you to iterate only over _own_ keys of an object when using `for ... in`.

## Installation

This module can be installed either with `npm` or with `yarn`, and should be installed as one of your project's `devDependencies`:
```
npm install --save-dev for-own.macro

# or

yarn add --dev for-own.macro
```

## Usage

Once you have [configured `babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md#adding-the-plugin-to-your-config) you can import/requie `import-all.macro`.

Here is an example:

```js
import own from "for-own.macro";

for (const key in own(obj)) {
  const value = obj[key];
}

//     ↓ ↓ ↓ ↓ ↓ ↓

for (const key in obj) if (Object.hasOwnProperty.call(obj, key)) {
  const value = obj[key];
}
```

## Caveats

The `own` macro only works inside `for ... in` loops. This code will throw an error at compile time:

```js
const ownProps = own(obj);
```

## LICENSE

MIT