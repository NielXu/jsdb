/**
 * Parse the nested query string key and value to a
 * nested object, for example:
 * `{"key.next.prev": "x"}` after parsing will
 * be `{key: {next: {prev: "x"}}}`.
 * If it is not a nested key, just return the original
 * object. The nested key should have form `a.b.c`, which
 * is `{a: {b: c: ...}}`
 * 
 * @param {String} query Query key
 */
function parseSingleNested(queryKey, queryValue) {
    const splitted = queryKey.split(".");
    if(splitted.length === 1) {
        return {[queryKey]: queryValue}
    }
    let obj = {[splitted[splitted.length-1]]: queryValue};
    for(var i=splitted.length-2;i>=0;i--) {
        obj = {[splitted[i]]: obj};
    }
    return obj;
}

/**
 * Parse the whole query object to the correct object.
 * For exampele, `{"key.A": {value: "OK"}, "value.B": {status: 200}}`
 * contains the nested keys `key.A` and `value.B`. It will be parsed
 * to `{key: {A: {value: "OK"}}, value: {B: {status: 200}}}`
 * @param {Object} query Query object
 */
function parseNested(query) {
    let newQuery;
    for(var key in query) {
        if(key.includes(".")) {
            if(!newQuery) {
                newQuery = parseSingleNested(key, query[key]);
            }
            else {
                newQuery = {...newQuery, ...parseSingleNested(key, query[key])};
            }
        }
        else {
            if(!newQuery) {
                newQuery = {[key]: query[key]};
            }
            else {
                newQuery[key] = query[key];
            }
        }
    }
    return newQuery? newQuery : query;
}

/**
 * Recursively merge the data and query
 * object. If strict is enabled, the field
 * in data will be completely replaced by
 * the query.
 * 
 * @param {Object} data Data object
 * @param {Object} query Query object
 * @param {Boolean} strict Strictly merge
 */
function recurMerge(data, query, strict) {
    // {id: "X", value: "Y"}, {value: "Q"}
    // {id: "X", value: {status: 200}}, {"value.status": 200} => {value: {status: 200}}
    // {id: "X"}, {value: "X"} => {id: "X", value: "X"}
    // {id: "X", value: {status: 200, message: "OK"}}, {value: {status: 400}}
    // => {id: "X", value: {status: 400}}
    for(var key in query) {
        if(data.hasOwnProperty(key)) {
            if(strict) {
                data[key] = query[key];
            }
            else if(typeof data[key] === 'object') {
                if(typeof query[key] === 'object') {
                    recurMerge(data[key], query[key]);
                }
                else {
                    data[key] = query[key];
                }
            }
            else {
                data[key] = query[key];
            }
        }
        else {
            data[key] = query[key];
        }
    }
}

/**
 * Tell if the query matched the data, return true
 * if it does, false otherwise. It can also handle
 * nested query or data.
 * If strictly matched is enabled, the query will be
 * compared with the data strictly, which means they
 * must have same properties and same values.
 * 
 * @param {Object} data Data object
 * @param {Object} query Query object
 * @param {Boolean} strict Strictly matched
 * @param {Number} level The recursion level, starts with 0
 */
function isMatched(data, query, strict, level) {
    let matched = true;
    for(var key in query) {
        if(data.hasOwnProperty(key)) {
            if(typeof query[key] === 'object') {
                if(!isMatched(data[key], query[key], strict, level+1)) {
                    matched = false;
                    break;
                }
            }
            else if(query[key] !== data[key]) {
                matched = false;
                break;
            }
        }
        else {
            matched = false;
            break;
        }
    }
    if(strict && level !== 0) {
        for(var key in data) {
            if(query.hasOwnProperty(key)) {
                if(typeof data[key] === 'object') {
                    if(!isMatched(data[key], query[key], strict, level+1)) {
                        matched = false;
                        break;
                    }
                }
                else if(query[key] !== data[key]) {
                    matched = false;
                    break;
                }
            }
            else {
                matched = false;
                break;
            }
        }
    }
    return matched;
}

module.exports = {
    /**
     * Parse the given query and find the matched
     * data from the provided data. Return an
     * empty array if nothing was found.
     * This function also supports nested query.
     * 
     * @param {Object} data Array of objects
     * @param {Object} query Object query
     */
    parseQuery: function(data, query) {
        let matched = [];
        const parsed = parseNested(query);
        const strict = JSON.stringify(parsed) === JSON.stringify(query)
        data.forEach((e) => {
            if(isMatched(e, parsed, strict, 0)) matched.push(e);
        });
        return matched;
    },
    /**
     * Merge the data object with the query object, replacing
     * the field in data to the field in query. For example,
     * `data={key: "A", value: "C"}`, `query={value: "X"}`,
     * merging them will be `{key: "A", value: "X"}`.
     * Return the result as a new object, the original object
     * will not be modified.
     * 
     * @param {Object} data A single object
     * @param {Object} query Object query
     */
    mergeDiff: function(data, query) {
        const cp = JSON.parse(JSON.stringify(data));
        const parsed = parseNested(query);
        const strict = JSON.stringify(query) === JSON.stringify(parsed);
        recurMerge(cp, parsed, strict);
        return cp;
    },
    parseNested: parseNested,
}