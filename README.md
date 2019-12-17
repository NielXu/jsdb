# JSDB
JSDB is a fast and easy to use temporary database based on JSON. It can be useful in different scenarios such as storing data temporarily, testing frontend API call with mock response data, updating JSON files etc.

# Get Started
There are different types of databases can be used and the most commonly used one is `BasicDatabase`. To create a new database and a table:

```JavaScript
const { BasicDatabase } = require('jsdb');
const datbase = new BasicDatabase();
database.create('example');
```

Then you can perform CRUD operations like any other databases

```JavaScript
database.use('example')     // Remember to use the table "example"
const example = {
    key: "X",
    value: "Y",
};
database.insert(example);   // Insert example into the table
database.read({});          // Read everything
database.update({           // Update data with key "X"
    key: "X"
}, {
    value: "G"
});
database.delete({})         // Delete everything
```

The query is designed to be similar with MongoDB except that it does not support too many identifiers (for now) like `$set`, `$gt`, `$lt` and so on.

# Host
JSDB also supports the functionality to host the database on local using `express.js`. To start the database server, simply run:

```bash
npm start   # or "npm start -- --PORT=8080" if running on custom port
```

Then using the following URLs to communicate with the database:

|Method|URL|Comment|
|------|---|-------|
|GET|/create/{tableName}|Create a new table with given name|
|GET|/drop/{tableName}|Drop a table with given name|
|GET|/list|List all table names|
|GET|/insert/{tableName}/{data}|Insert data into the table|
|GET|/read/{tableName}/{query}?|Read all the data that match the query, or all data if query is not given|
|GET|/update/{tableName}/{query}/{update}|Update the data that match the query|
|GET|/delete/{tableName}/{query}?|Delete all the data that match the query, or all data if query is not given|

# Testing
One of the use case of JSDB is to mock the data sent back from the backend when developing the frontend. We might want to retrieve the data with some delay as well since we are simulating a real call. In this case, `promiseWrap` and `callbackWrap` might be helpful:

```JavaScript
const { promiseWrap, callbackWrap } = require('jsdb');

// Wrap the database result in promise way with 1000ms delay
promiseWrap(database.read({}), 1000)
    .then(result => {
        console.log(result);
    });

// Wrap the database result in callback way with 1000ms delay
callbackWrap(database.read({}), (result) => {
    console.log(result);
}, 1000);
```

# TODO
- [ ] Add support of identifiers such as `$gt`, `$lt`
- [ ] AsyncDatabase, every operation is async
- [ ] SchemaDatabase, a database that based on schema instead of storing objects
- [ ] ImmutableDatabase, immutable and produce new results in every step
- [ ] UniqueDatabase, produce unique index for every document (like MongoDB ObjectID)
- [ ] Export database to JSON files
- [ ] Import database from JSON files
- [ ] Tests for `host` calls