const { BasicDatabase, exportDatabase, importDatabase } = require('../src/db');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');
const TABLE = "test";

describe('BasicDatabase', () => {

    describe('Constuctor', () => {
        it('should return what I passed to the constructor before any operations', () => {
            const init = [{
                key: "A", value: "B"
            }, {
                key: "C", value: "D"
            }];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            expect(basic.data[TABLE].data).to.deep.equal(init);
        });

        it('should have empty array if nothing is passed to the constructor', () => {
            const basic = new BasicDatabase();
            basic.create(TABLE);
            expect(basic.data[TABLE].data).to.deep.equal([]);
        });
    });

    describe('Mutable', () => {
        it('data should changed if modifying the data passed in', () => {
            const init = [{
                key: "A", value: "B"
            }, {
                key: "C", value: "D"
            }];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            init[0]['value'] = 'X';
            expect(basic.data[TABLE].data).to.deep.equal(init);
        });
    });

    describe('Read', () => {
        const init = [
            {
                key: "A",
                value: "B",
                others: "X"
            },
            {
                key: "C",
                value: "D",
                others: "X"
            },
            {
                key: "E",
                nested: {
                    innerKey: "Z",
                    innerValue: "Q"
                }
            }
        ];
        it('should return me correct data by query', () => {
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            expect(basic.read({key: "A"}, TABLE)).to.deep.equal([init[0]]);
            expect(basic.read({others: "X"}, TABLE)).to.deep.equal([init[0], init[1]]);
            expect(basic.read({nested: {innerKey: "Z", innerValue: "Q"}}, TABLE)).to.deep.equal([init[2]]);
            expect(basic.read({key: "P"}, TABLE)).to.deep.equal([]);
            expect(basic.read({nested: {innerKey: "L", innerValue: "Q"}}, TABLE)).to.deep.equal([]);
        });

        it('should return me nothing if no data in database', () => {
            const basic = new BasicDatabase();
            basic.create(TABLE, []);
            expect(basic.read({key: "A"}, TABLE)).to.deep.equal([]);
        });

        it('should return me all data if query object is empty', () => {
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            expect(basic.read({}, TABLE)).to.deep.equal(init);
        });
    });

    describe('Delete', () => {
        it('should delete the data by query', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const deleted = basic.delete({key: "A"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "C", value: "D"}]);
            expect(deleted.data).to.deep.equal([{key: "A", value: "B"}]);
            expect(deleted.count).to.equal(1);
        });

        it('should not delete anything query found nothing', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const deleted = basic.delete({key: "Q"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A", value: "B"}, {key: "C", value: "D"}]);
            expect(deleted.data).to.deep.equal([]);
            expect(deleted.count).to.equal(0);
        });

        it('should delete everything if query is empty', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const deleted = basic.delete({}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([]);
            expect(deleted.data).to.deep.equal([{key: "A", value: "B"}, {key: "C", value: "D"}]);
            expect(deleted.count).to.equal(2);
        });

        it('should delete multiple data if query matched them all', () => {
            const init = [
                {key: "A", value: "X"},
                {key: "D", value: "Y"},
                {key: "C", value: "X"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const deleted = basic.delete({value: "X"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "D", value: "Y"}]);
            expect(deleted.data).to.deep.equal([{key: "A", value: "X"}, {key: "C", value: "X"}]);
            expect(deleted.count).to.equal(2);
        });
    });

    describe('Update', () => {
        it('should update data by query', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({key: "A"}, {value: "X"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A", value: "X"}, {key: "C", value: "D"}]);
            expect(updated.data).to.deep.equal([{key: "A", value: "X"}]);
            expect(updated.count).to.equal(1);
        });

        it('should update multiple data by query', () => {
            const init = [
                {key: "A", value: 1, status: "BAD"},
                {key: "B", value: 1, status: "OK"},
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({value: 1}, {status: "GOOD"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A", value: 1, status: "GOOD"}, {key: "B", value: 1, status: "GOOD"}]);
            expect(updated.data).to.deep.equal([{key: "A", value: 1, status: "GOOD"}, {key: "B", value: 1, status: "GOOD"}]);
            expect(updated.count).to.equal(2);
        });

        it('should update nested data by query', () => {
            const init = [
                {key: "A"},
                {key: "B", status: {code: 200}}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({key: "B"}, {"status.code": 400}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A"}, {key: "B", status: {code: 400}}]);
            expect(updated.data).to.deep.equal([{key: "B", status: {code: 400}}]);
            expect(updated.count).to.equal(1);
        });

        it('should add extra fields to data', () => {
            const init = [
                {value: "X", status: 0},
                {value: "X", status: 0},
                {value: "Y"}
            ];
            const ex = [
                {value: "X", status: 0, flag: true},
                {value: "X", status: 0, flag: true},
                {value: "Y"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({status: 0}, {flag: true}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
            expect(updated.data).to.deep.equal([
                {value: "X", status: 0, flag: true},
                {value: "X", status: 0, flag: true}
            ]);
            expect(updated.count).to.equal(2);
        });

        it('should update multiple nested data by query', () => {
            const init = [
                {value: "X", status: {code: 200}},
                {value: "Y", status: {code: 401}},
                {value: "X", status: {code: 400}}
            ];
            const ex = [
                {value: "X", status: {code: 500}},
                {value: "Y", status: {code: 401}},
                {value: "X", status: {code: 500}}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({value: "X"}, {"status.code": 500}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
            expect(updated.data).to.deep.equal([
                {value: "X", status: {code: 500}},
                {value: "X", status: {code: 500}}
            ]);
            expect(updated.count).to.equal(2);
        });

        it('should update data without nested field but appear in query', () => {
            const init = [
                {value: "X"},
                {key: "Y"},
                {value: "Y"}
            ];
            const ex = [
                {value: "X"},
                {key: "Y"},
                {value: "Y", status: {code: 200}}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({value: "Y"}, {"status.code": 200}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
            expect(updated.data).to.deep.equal([
                {value: "Y", status: {code: 200}}
            ]);
            expect(updated.count).to.equal(1);
        });

        it('should update data with strict nested query', () => {
            const init = [
                {value: "X", status: {code: 200, message: "OK"}},
                {value: "X"},
                {value: "Y", status: {code: 401, message: "BAD"}}
            ];
            const ex = [
                {value: "X", status: {code: 500}},
                {value: "X", status: {code: 500}},
                {value: "Y", status: {code: 401, message: "BAD"}}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({value: "X"}, {status: {code: 500}}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
            expect(updated.data).to.deep.equal([
                {value: "X", status: {code: 500}},
                {value: "X", status: {code: 500}},
            ]);
            expect(updated.count).to.equal(2);
        });

        it('should update all data with empty query', () => {
            const init = [
                {value: "X", status: {code: 200}},
                {value: "Y", status: {code: 401}},
                {value: "X", status: {code: 400}}
            ];
            const ex = [
                {value: "X", status: "Done"},
                {value: "Y", status: "Done"},
                {value: "X", status: "Done"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            const updated = basic.update({}, {status: "Done"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
            expect(updated.data).to.deep.equal([
                {value: "X", status: "Done"},
                {value: "Y", status: "Done"},
                {value: "X", status: "Done"}
            ]);
            expect(updated.count).to.equal(3);
        });
    });

    describe('Error handling', () => {
        const init = [
            {value: "X", status: {code: 200, message: "OK"}},
            {value: "X"},
            {value: "Y", status: {code: 401, message: "BAD"}}
        ];
        const initAnother = [
            {value: "X", status: {code: 0, message: "STOP"}},
            {value: "X"},
            {value: "Y", status: {code: 0, message: "STOP"}}
        ];
        const basic = new BasicDatabase();
        basic.create(TABLE, init);
        basic.create("another", initAnother);
        it('should throw error when querying before specifying table to use', () => {
            expect(()=>basic.read({})).to.throw("No table is selected");
        });

        it('should throw error when trying to create tables with duplicated names', () => {
            expect(()=>basic.create(TABLE)).to.throw(`Table with name "${TABLE}" already exists`);
        });

        it('should throw error when trying to access table which does not exists', () => {
            expect(()=>basic.use("null")).to.throw(`Table with name "null" does not exists`);
        });

        it('should throw error when read from a table which does not exists', () => {
            expect(()=>basic.read({}, "null")).to.throw(`Table with name "null" does not exists`);
        });

        it('should throw error when insert to a table which does not exists', () => {
            expect(()=>basic.insert({}, "null")).to.throw(`Table with name "null" does not exists`);
        });

        it('should throw error when update in a table which does not exists', () => {
            expect(()=>basic.update({}, {}, "null")).to.throw(`Table with name "null" does not exists`);
        });

        it('should throw error when delete in a table which does not exists', () => {
            expect(()=>basic.insert({}, "null")).to.throw(`Table with name "null" does not exists`);
        });

        it('should throw error if the init data is not an array but string when creating new table', () => {
            expect(()=>basic.create("new", "Something")).to.throw(`Unsupported data type: "string"`);
        });

        it('should throw error if the init data is not an array but object when creating new table', () => {
            expect(()=>basic.create("new", {"x": "y"})).to.throw(`Unsupported data type: "object"`);
        });

        it('should throw error if dropping a table that is not exists', () => {
            expect(()=>basic.drop("null")).to.throw(`Table with name "null" does not exists`);
        })
    });

    describe('Switch between tables', () => {
        const init = [
            {value: "X", field: "OK", finished: true},
            {value: "X", field: "BAD"},
            {value: "Y", field: {status: "FAILED"}}
        ];
        const initAnother = [
            {value: "G"},
            {value: "X", field: "BAD"},
            {value: "Z", field: {status: "GOOD"}}
        ];
        const basic = new BasicDatabase();
        const TABLE_A = "a";
        const TABLE_B = "b";
        basic.create(TABLE_A, init);
        basic.create(TABLE_B, initAnother);
        it('should use the table that I specified', () => {
            basic.use(TABLE_A);
            const result = basic.read({value: "Y"});
            expect(result).to.deep.equal([init[2]]);
            basic.use(TABLE_B);
            const resultB = basic.read({value: "Y"});
            expect(resultB).to.deep.equal([]);
        });
        
        it('update one table should not affect the others', () => {
            basic.use(TABLE_A);
            basic.update({value: "X", field: "BAD"}, {field: "GOOD"});
            expect(basic.data[TABLE_A].data).to.deep.equal(init);
            expect(basic.data[TABLE_B].data).to.deep.equal(initAnother);
        });
    });

    describe('Drop table', () => {
        const common = {value: "X", field: "BAD"};
        const init = [
            {value: "X", field: "OK", finished: true},
            common,
            {value: "Y", field: {status: "FAILED"}}
        ];
        const initAnother = [
            {value: "G"},
            common,
            {value: "Z", field: {status: "GOOD"}}
        ];
        const basic = new BasicDatabase();
        const TABLE_A = "a";
        const TABLE_B = "b";
        basic.create(TABLE_A, init);
        basic.create(TABLE_B, initAnother);
        it('should drop a table without affecting others', () => {
            basic.drop(TABLE_B);
            expect(basic.data[TABLE_A].data).to.deep.equal([
                {value: "X", field: "OK", finished: true},
                common,
                {value: "Y", field: {status: "FAILED"}}
            ]);
            expect(()=>basic.use(TABLE_B)).to.throw(`Table with name "${TABLE_B}" does not exists`);
        });
    });

});


describe('Export/Import database', () => {
    const db = new BasicDatabase();
    const init = [{
        key: "X",
        value: "Y",
        status: {code: 200, message: 'Success'}
    }, {
        key: "J",
        value: "Z",
        status: 500
    }]
    db.create("temp", init);
    it('should export and import the database', () => {
        exportDatabase(db, "test", __dirname);
        const js = require('./test');
        expect(js.hasOwnProperty("tables"));
        expect(js.hasOwnProperty("type"));
        const imdb = importDatabase("test", __dirname);
        expect(imdb.list()).to.deep.equal(["temp"]);
        imdb.use("temp");
        expect(imdb.read({})).to.deep.equal(init);
    });

    after(() => {
        fs.unlinkSync(`${path.resolve(__dirname, "test.json")}`);
    });
});