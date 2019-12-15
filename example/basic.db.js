const { BasicDatabase } = require('../src/db');
// This is en example of using BaiscDatabase, please
// always remember that the BasicDatabase is mutatable
// which means the data passed in will be changed in place,
// you might not want this to happen in some cases.

// Create a new database and two new tables
const db = new BasicDatabase();
db.create("admin");
db.create("member");

// Use "admin" table, this must be specified before querying
db.use("admin");
console.log(db.using);
console.log("===========================");

// Insert a new data to the "admin" table
db.insert({
    firstname: "Daniel",
    lastname: "Xu",
    username: "dnx",
    password: "123",
    comment: "Good developer"
});
// Check all the data we have inserted, this should
// show the data that we just inserted
console.log(db.read({}));
console.log("===========================");

// Insert antoher one to the "admin" table
db.insert({
    firstname: "Foo",
    lastname: "bar",
    username: "fooo",
    password: "barr",
    comment: "Good developer"
});
// Check all data again to make sure we have inserted
console.log(db.read({}));
console.log("===========================");

// Read with query, only data that matched the query
// will be returned, in this case, the two data that
// we inserted will be returned
console.log(db.read({comment: "Good developer"}));
console.log("===========================");

// But this query should only return one data since
// only one matches
console.log(db.read({firstname: "Foo"}));
console.log("===========================");