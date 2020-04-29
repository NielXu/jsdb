const { BasicDatabase, importDatabase, exportDatabase } = require('../src/db');
// An example of importing and exporting a database

const db = new BasicDatabase();
db.create("customer");
db.use("customer");

db.insert({
    id: "9k",
    firstname: "Daniel",
    lastname: "Xu",
    friends: [
        {id: "12g"},
        {id: "0f"}
    ]
});
db.insert({
    id: "12g",
    firstname: "JunXing",
    lastname: "XX",
    friends: [
        {id: "9k"},
        {id: "0f"}
    ]
});
db.insert({
    id: "0f",
    firstname: "Foo",
    lastname: "Bar",
    friends: [
        {id: "9k"},
        {id: "12g"}
    ]
});
console.log(db.read({}));
exportDatabase(db, "tmp", ".");

const newdb = importDatabase("tmp", ".");
newdb.use("customer");
console.log(newdb.read({}));
