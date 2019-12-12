const { BasicDatabase } = require('../src/db');

const basicA = new BasicDatabase([{key: "A", value: "B"}]);
basicA.insert({key: "C", value: "D"});
console.log(basicA.data);