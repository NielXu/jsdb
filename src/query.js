/**
 * Tell if the query matched the data, return true
 * if it does, false otherwise. It can also handle
 * nested query or data.
 * 
 * @param {Object} data Data object
 * @param {Object} query Query object
 */
function isMatched(data, query) {
    let matched = true;
    for(var key in query) {
        if(data.hasOwnProperty(key)) {
            if(typeof query[key] === 'object') {
                if(!isMatched(data[key], query[key])) {
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
        data.forEach((e) => {
            if(isMatched(e, query)) matched.push(e);
        });
        return matched;
    }
}