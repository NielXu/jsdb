const { parseQuery, parseNested, mergeDiff } = require('../src/query');
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
    }, {
        key: "Z",
        value: "Q",
        wrap: {
            innerKey: "I",
            innerValue: "S"
        }
    }, {
        wrap: {
            "innerInnerWrap": {
                  "innerInnerKey": "U"
            }
        }
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
        const query = {wrap: {innerKey: "R", innerValue: "S"}};
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[4]]);
    });

    it('should return me matched data by query with more nested object', () => {
        const query = {
            wrap: {
                innerWrap: {
                    innerInnerWrap: {
                        innerInnerKey: "U",
                    }
                },
                innerKey: "V"
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

    it('should return me the matched data by query with nested key', () => {
        const query = {
            "wrap.innerKey": "R"
        }
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[4]]);
    });

    it('should return me the matched data by query with more nested key', () => {
        const query = {
            "wrap.innerWrap.innerInnerWrap.innerInnerKey": "U"
        }
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[5]]);
    });

    it('should return me empty array if nested key not mathed anything', () => {
        const query = {
            "wrap.innerWrap.nonExisting": "X"
        }
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([]);
    });

    it('should return me the matched data by query with nested key and more condition', () => {
        const query = {
            "wrap.innerValue": "S",
            key: "Z"
        }
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[7]]);
    });

    it('should return me the matched data by query with exact nested match', () => {
        const query = {
            wrap: {
                "innerInnerWrap": {
                      "innerInnerKey": "U"
                }
            }
        }
        const result = parseQuery(data, query);
        expect(result).to.deep.equal([data[8]]);
    });
});

describe('Query module - parseNested()', () => {
    it('should return correct object', () => {
        const query = {
            "key.A.B": "X"
        }
        const result = parseNested(query);
        expect(result).to.deep.equal({key: {A: {B: "X"}}});
    });

    it('should return original object if no nested found', () => {
        const query = {
            "key": "X"
        }
        const result = parseNested(query);
        expect(result).to.deep.equal({key: "X"});
    });

    it('should return correct object with nested value', () => {
        const query = {
            "key.A.B": {
                status: {
                    code: 200
                }
            }
        }
        const result = parseNested(query);
        expect(result).to.deep.equal({key: {A: {B: {status: {code: 200}}}}});
    });

    it('should return correct object with nested and not nested value', () => {
        const query = {
            "key.A": {
                value: "OK"
            },
            "B": "Good"
        };
        const result = parseNested(query);
        expect(result).to.deep.equal({key: {A: {value: "OK"}}, B: "Good"});
    });

    it('should return correct object with multiple nested values', () => {
        const query = {
            "key.A": {
                value: "OK"
            },
            "value.B": {
                status: "Good"
            }
        };
        const result = parseNested(query);
        expect(result).to.deep.equal({key: {A: {value: "OK"}}, value:{ B: {status: "Good"}}});
    });
});

describe('Query module - mergeDiff()', () => {
    it('should return correct object with simple query', () => {
        const data = {key: "X", value: "Y"};
        const query = {value: "Z"};
        const result = mergeDiff(data, query);
        expect(result).to.deep.equal({key: "X", value: "Z"});
    });

    it('should return correct object if data and query both contain object', () => {
        const data = {key: "X", value: {status: 200, message: "Success"}};
        const query = {"value.status": 400};
        const result = mergeDiff(data, query);
        expect(result).to.deep.equal({key: "X", value: {status: 400, message: "Success"}});
    });

    it('should return correct object if data have object and query has strict object', () => {
        const data = {key: "X", value: {status: 200, message: "Success"}};
        const query = {value: {status: 400}};
        const result = mergeDiff(data, query);
        expect(result).to.deep.equal({key: "X", value: {status: 400}});
    });

    it('should return correct object if data have no object but query does', () => {
        const data = {key: "X", value: "Y"};
        const query = {value: {status: 200, message: "OK"}};
        const result = mergeDiff(data, query);
        expect(result).to.deep.equal({key: "X", value: {status: 200, message: "OK"}});
    });

    it('should return correct object if data has object but query does not', () => {
        const data = {key: "X", value: {status: 200, message: "OK"}};
        const query = {value: "Y"};
        const result = mergeDiff(data, query);
        expect(result).to.deep.equal({key: "X", value: "Y"});
    });

    it('should return correct object with same name in different layer in data object', () => {
        const data = {key: "X", value: {status: {code: 200, message: "OK"}, message: "Success"}};
        const query = {"value.status.message": "YES"};
        const result = mergeDiff(data, query);
        expect(result).to.deep.equal({key: "X", value: {status: {code: 200, message: "YES"}, message: "Success"}})
    });

    it('should return correct object if data has no such field', () => {
        const data = {key: "X"};
        const query = {value: "Y"};
        const result = mergeDiff(data, query);
        expect(result).to.deep.equal({key: "X", value: "Y"});
    });

    it('should return correct object with inPlace enabled', () => {
        const data = {key: "X", value: {status: 200}};
        const query = {"value.status": 400};
        const result = mergeDiff(data, query, true);
        expect(result).to.deep.equal(data);
    });

    it('should return correct object with data has no nested field but query does', () => {
        const data = {key: "X"};
        const query = {"status.code": 200};
        const result = mergeDiff(data, query, true);
        expect(result).to.deep.equal({key: "X", status: {code: 200}});
    })

})