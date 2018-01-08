# botbuilder-mongoose-middleware
Middleware to store states in mongodb using mongoose


### Install Package
```
  npm i --save botbuilder-mongoose-middleware
```

```javascript
import {IStorageClient} from 'botbuilder-mongoose-middleware';
import {AzureBotStorage} from 'azure-storage';

mongoose.Promise = require('bluebird');
const dbPromise = mongoose.connect(process.env.MONGO_URL);

dbPromise.then((db) => {
  console.log("DB Connected..");
});

const collectionName = "userData";

var docDbClient = new IStorageClient({db: dbPromise, collectionName}); //collection name is optional (default: userData)

var tableStorage = new AzureBotStorage({ gzipData: false }, docDbClient); //passing object to here

var bot = new builder.UniversalBot(connector).set('storage', tableStorage);//set your storage here

```
