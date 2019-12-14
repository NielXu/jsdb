const { BasicDatabase } = require('../src/db');
const { expect } = require('chai');
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
            basic.delete({key: "A"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "C", value: "D"}]);
        });

        it('should not delete anything query found nothing', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            basic.delete({key: "Q"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A", value: "B"}, {key: "C", value: "D"}]);
        });

        it('should delete everything if query is empty', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            basic.delete({}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([]);
        });

        it('should delete multiple data if query matched them all', () => {
            const init = [
                {key: "A", value: "X"},
                {key: "D", value: "Y"},
                {key: "C", value: "X"}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            basic.delete({value: "X"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "D", value: "Y"}]);
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
            basic.update({key: "A"}, {value: "X"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A", value: "X"}, {key: "C", value: "D"}]);
        });

        it('should update multiple data by query', () => {
            const init = [
                {key: "A", value: 1, status: "BAD"},
                {key: "B", value: 1, status: "OK"},
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            basic.update({value: 1}, {status: "GOOD"}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A", value: 1, status: "GOOD"}, {key: "B", value: 1, status: "GOOD"}]);
        });

        it('should update nested data by query', () => {
            const init = [
                {key: "A"},
                {key: "B", status: {code: 200}}
            ];
            const basic = new BasicDatabase();
            basic.create(TABLE, init);
            basic.update({key: "B"}, {"status.code": 400}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal([{key: "A"}, {key: "B", status: {code: 400}}]);
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
            basic.update({status: 0}, {flag: true}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
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
            basic.update({value: "X"}, {"status.code": 500}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
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
            basic.update({value: "Y"}, {"status.code": 200}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
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
            basic.update({value: "X"}, {status: {code: 500}}, TABLE);
            expect(basic.data[TABLE].data).to.deep.equal(init);
            expect(basic.data[TABLE].data).to.deep.equal(ex);
        });
    })

});
