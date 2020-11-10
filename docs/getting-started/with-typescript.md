In order to use Dash SDK with TypeScript, you will need some dependencies to be manually installed.   

`npm install -g typescript` - Required for compilation (`tsc`).    
`npm install -g ts-node` - Required for REPL / Execution.     

Create a new file, and assuming you name it `myScript.ts`.    

```js
import Dash from 'dash';
const clientOpts = {
  network: 'testnet',
  wallet: {
    mnemonic: null, // Will generate a new address, you should keep it.
  },
};
const client = new Dash.Client(clientOpts);

client.isReady().then(()=> console.log('isReady'));
```

Have a following `tsconfig.json` file

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

**Run without compiling**: `ts-node myScript.ts`  
**Compile:** `tsc -p tsconfig.json`  
**Run:** `node myScript.js`  
