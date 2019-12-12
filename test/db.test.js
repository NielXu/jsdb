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
        })
    });
});
