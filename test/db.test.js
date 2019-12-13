const { BasicDatabase } = require('../src/db');
const { expect } = require('chai');

describe('BasicDatabase', () => {

    describe('Constuctor', () => {
        it('should return what I passed to the constructor before any operations', () => {
            const init = [{
                key: "A", value: "B"
            }, {
                key: "C", value: "D"
            }];
            const basic = new BasicDatabase(init);
            expect(basic.data).to.deep.equal(init);
        });

        it('should have empty array if nothing is passed to the constructor', () => {
            const basic = new BasicDatabase();
            expect(basic.data).to.deep.equal([]);
        });
    });

    describe('Mutable', () => {
        it('data should changed if modifying the data passed in', () => {
            const init = [{
                key: "A", value: "B"
            }, {
                key: "C", value: "D"
            }];
            const basic = new BasicDatabase(init);
            expect(basic.data).to.deep.equal(init);
            init[0]['value'] = 'X';
            expect(basic.data).to.deep.equal(init);
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
            const basic = new BasicDatabase(init);
            expect(basic.read({key: "A"})).to.deep.equal([init[0]]);
            expect(basic.read({others: "X"})).to.deep.equal([init[0], init[1]]);
            expect(basic.read({nested: {innerKey: "Z", innerValue: "Q"}})).to.deep.equal([init[2]]);
            expect(basic.read({key: "P"})).to.deep.equal([]);
            expect(basic.read({nested: {innerKey: "L", innerValue: "Q"}})).to.deep.equal([]);
        });

        it('should return me nothing if no data in database', () => {
            const basic = new BasicDatabase();
            expect(basic.read({key: "A"})).to.deep.equal([]);
        });

        it('should return me all data if query object is empty', () => {
            const basic = new BasicDatabase(init);
            expect(basic.read({})).to.deep.equal(init);
        });
    });

    describe('Delete', () => {
        it('should delete the data by query', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase(init);
            basic.delete({key: "A"});
            expect(basic.data).to.deep.equal(init);
            expect(basic.data).to.deep.equal([{key: "C", value: "D"}]);
        });

        it('should not delete anything query found nothing', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase(init);
            basic.delete({key: "Q"});
            expect(basic.data).to.deep.equal(init);
            expect(basic.data).to.deep.equal([{key: "A", value: "B"}, {key: "C", value: "D"}]);
        });

        it('should delete everything if query is empty', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase(init);
            basic.delete({});
            expect(basic.data).to.deep.equal(init);
            expect(basic.data).to.deep.equal([]);
        });

        it('should delete multiple data if query matched them all', () => {
            const init = [
                {key: "A", value: "X"},
                {key: "D", value: "Y"},
                {key: "C", value: "X"}
            ];
            const basic = new BasicDatabase(init);
            basic.delete({value: "X"});
            expect(basic.data).to.deep.equal(init);
            expect(basic.data).to.deep.equal([{key: "D", value: "Y"}]);
        });
    });

    describe('Update', () => {
        it('should update data by query', () => {
            const init = [
                {key: "A", value: "B"},
                {key: "C", value: "D"}
            ];
            const basic = new BasicDatabase(init);
            basic.update({key: "A"}, {value: "X"});
            console.log(basic.data);
            expect(basic.data).to.deep.equal(init);
            expect(basic.data).to.deep.equal([{key: "A", value: "X"}, {key: "C", value: "D"}]);
        })
    })

});
