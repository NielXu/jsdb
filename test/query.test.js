const { parseQuery } = require('../src/query');
const { expect } = require('chai');

describe('Query module - parseQuery()', () => {
    const data = [{
        key: "A",
        value: "B",
        field: "C",
        extra: "D"
    }, {
        key: "E",
        value: "F",
        field: "G",
        extra: "H"
    }, {
        key: "I",
        value: "J",
        field: "K",
        extra: "D"
    }, {
        key: "L",
        value: "M",
        field: "N",
        extra: "O",
        flag: true
    }, {
        key: "P",
        value: "Q",
        wrap: {
            innerKey: "R",
            innerValue: "S"
        }
    }, {
        key: "T",
        wrap: {
            innerWrap: {
                innerInnerWrap: {
                    innerInnerKey: "U",
                }
            },
            innerKey: "V"
        }
    }, {
        key: "X",
        wrap: {},
    }];
    it('should return the matched data by query with only one field', () => {
        const query = {key: "A"};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[0]]);
    });

    it('should return the matched data by query with common fields', () => {
        const query = {extra: "D"};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[0], data[2]]);
    });

    it('should return the matched data by query with common fields but restricted key', () => {
        const query = {extra: "D", value: "B"};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[0]]);
    });

    it('should return me nothing if query contains unexisting key', () => {
        const query = {value: "B", unreal: true, key: "A"};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([]);
    });

    it('should return me matched data with some unique field', () => {
        const query = {flag: true};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[3]]);
    });

    it('should return me matched data by query with nested object', () => {
        const query = {wrap: {innerKey: "R"}};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[4]]);
    });

    it('should return me matched data by query with more nested object', () => {
        const query = {
            wrap: {
                innerWrap: {
                    innerInnerWrap: {
                        innerInnerKey: "U"
                    }
                },
                innerKey: "V",
            }
        };
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[5]]);
    });

    it('should return me nothing if data is not nested but query does', () => {
        const query = {
            key: "E",
            value: {
                unExistingKey: "Q"
            }
        }
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([]);
    });

    it('should return me all matched data by query with empty nested object', () => {
        const query = {wrap: {}};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[4], data[5], data[6]]);
    });

    it('should return me nothing if data is nested but query is not', () => {
        const query = {
            wrap: "X"
        }
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([]);
    });

    it('should return me all data if query is empty', () => {
        const query = {};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal(data);
    });
});