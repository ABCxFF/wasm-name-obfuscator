# wasm-name-obfuscator
Takes a wasm file as input, and outputs the same wasm file with visually obfuscated variables and functions

## Usage

Using the hexadecimal naming style:
```js
const obfuscate = require('./obfuscate');

wasmBinary = obfuscate(wasmBinary, 'hex');
```

Converts 
```wasm
(module
  (func $foo (param $bar i32) (param $baz i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $bar))
      (local.get $baz))))
```
to
```wasm
(module
  (func $36c4bd825ca26d0e (param $8b9ec7c39b540c98 i32) (param $b7b3caa754130501 i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $8b9ec7c39b540c98))
      (local.get $b7b3caa754130501))))
```

<br><br>

Using the alpha numeral naming style:
```js
const obfuscate = require('./obfuscate');

wasmBinary = obfuscate(wasmBinary, 'alphanumeral');
```
Converts 
```wasm
(module
  (func $foo (param $bar i32) (param $baz i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $bar))
      (local.get $baz))))
```
to
```wasm
(module
  (func $7r6p0liouow9gzud2u2ilcu6 (param $sutiibgb2ysn7rqi9dsivqbv i32) (param $hg1guxhwc9tli8r0zjeoijzf i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $sutiibgb2ysn7rqi9dsivqbv))
      (local.get $hg1guxhwc9tli8r0zjeoijzf))))
```

<br><br>

Using the alternating naming style:
```js
const obfuscate = require('./obfuscate');

wasmBinary = obfuscate(wasmBinary, 'alternating');
```
Converts 
```wasm
(module
  (func $foo (param $bar i32) (param $baz i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $bar))
      (local.get $baz))))
```
to
```wasm
(module
  (func $øôöøóööóóóøóøöóøóôøöøóôøøóôöôôóö (param $ûúúúúúúúuüûúûuuüûuuúuüûüüúuúuüuû i32) (param $úuûúúüúuûûúûûûüúuüüúûûûúuüúuüuuü i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $ûúúúúúúúuüûúûuuüûuuúuüûüüúuúuüuû))
      (local.get $úuûúúüúuûûúûûûüúuüüúûûûúuüúuüuuü))))
```


<br><br>

Using a custom naming style:
```js
const obfuscate = require('./obfuscate');

function generateName() {
  return Math.random().toString().slice(2);
}

wasmBinary = obfuscate(wasmBinary, generateName);
```
Converts 
```wasm
(module
  (func $foo (param $bar i32) (param $baz i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $bar))
      (local.get $baz))))
```
to
```wasm
(module
  (func $6403602627803417 (param $7133385209512313 i32) (param $5483681676308665 i32)
    (i32.add
      (i32.add
        (i32.const 5)
        (local.get $7133385209512313))
      (local.get $5483681676308665))))
```
