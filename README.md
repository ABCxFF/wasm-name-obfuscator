# wasm-obfuscator
Takes a wasm file as input, and outputs the same wasm file with visually obfuscated variables and functions

## Usage

All the following examples obfuscate the following code, whose binary format is defined in `wasmBinary` in the javascript sample
```wasm
(module
  (func $foo (param $bar i32) (param $baz i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $bar))
      (local.get $baz))))
```
---
Hexadecimal naming style:
```js
const obfuscate = require('./obfuscate');

wasmBinary = obfuscate(wasmBinary, 'hex');
```

Converts to
```wasm
(module
  (func $36c4bd825ca26d0e (param $8b9ec7c39b540c98 i32) (param $b7b3caa754130501 i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $8b9ec7c39b540c98))
      (local.get $b7b3caa754130501))))
```
---
Alphanumeral naming style:
```js
const obfuscate = require('./obfuscate');

wasmBinary = obfuscate(wasmBinary, 'alphanumeral');
```
Converts to
```wasm
(module
  (func $7r6p0liouow9gzud2u2ilcu6 (param $sutiibgb2ysn7rqi9dsivqbv i32) (param $hg1guxhwc9tli8r0zjeoijzf i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $sutiibgb2ysn7rqi9dsivqbv))
      (local.get $hg1guxhwc9tli8r0zjeoijzf))))
```
---
Alternating naming style:
```js
const obfuscate = require('./obfuscate');

wasmBinary = obfuscate(wasmBinary, 'alternating');
```
Converts to 
```wasm
(module
  (func $øôöøóööóóóøóøöóøóôøöøóôøøóôöôôóö (param $ûúúúúúúúuüûúûuuüûuuúuüûüüúuúuüuû i32) (param $úuûúúüúuûûúûûûüúuüüúûûûúuüúuüuuü i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $ûúúúúúúúuüûúûuuüûuuúuüûüüúuúuüuû))
      (local.get $úuûúúüúuûûúûûûüúuüüúûûûúuüúuüuuü))))
```
---
Custom naming style:
```js
const obfuscate = require('./obfuscate');

function generateName() {
  return Math.random().toString().slice(2);
}

wasmBinary = obfuscate(wasmBinary, generateName);
```
Converts to
```wasm
(module
  (func $6403602627803417 (param $7133385209512313 i32) (param $5483681676308665 i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $7133385209512313))
      (local.get $5483681676308665))))
```

---
---
---

For a naming style to be used against debugging, try the following:
```js
const obfuscate = require('./obfuscate');

function generateName() {
  return "$";
}

wasmBinary = obfuscate(wasmBinary, generateName);
```
It will convert the wasm file to
```wasm
(module
  (func $ABC (param $ABC i32) (param $ABC i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $ABC))
      (local.get $ABC))))
```
This form of static naming is not included into the package, but can be used to mess with Web Assembly debuggers such as Chrome's debugger. See the image for reference:
<img width="960" alt="" src="https://user-images.githubusercontent.com/79597906/131603153-701b4b0b-f3f1-4de3-9f0d-d25280f8d54a.png">
As you can see there is one parameter and multiple locals in the function exported as "t", but only the parameter is shown in the `Local Scope` tab due to the fact they all share the same name. This makes it incredibly difficult to debug the wasm file, without knowledge of the naming section.

## Disclaimers

1. Can increase wasm file size by large amounts. Do not use if you'd like very quick loading or instantiation.
2. The code itself is not obfuscated, only the variable and function names changed
