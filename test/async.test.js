const { BasicDatabase } = require('../src/db');
const { promiseWrap, callbackWrap } = require('../src/async');
const { expect } = require('chai');
const TABLE = "test";

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
const basic = new BasicDatabase();
basic.create(TABLE, init);

describe('PromiseWrap', () => {
    describe('Read', () => {
        it('should return me data after delay', (done) => {
            promiseWrap(basic.read({key: "A"}, TABLE), 500)
                .then(result => {
                    expect(result).to.deep.equal([init[0]]);
                    done();
                });
        });
    });
});

describe('CallbackWrap', () => {
    describe('Read', () => {
        it('should return me data after delay', (done) => {
            callbackWrap(basic.read({key: "A"}, TABLE), (result) => {
                expect(result).to.deep.equal([init[0]]);
                done();
            }, 500);
        });
    });
});