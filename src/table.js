const { parseQuery, mergeDiff } = require('./query');

/**
 * Find the index of matched data and return
 * them in an array.
 * 
 * @param {Ojbect} data Array of objects
 * @param {Object} found Array of found objects
 */
function findCandidateIndex(data, found) {
    let candidate = [];
    for(var i=0;i<data.length;i++) {
        const data_ = data[i];
        for(var j=0;j<found.length;j++) {
            const foundData = found[j];
            if(data_ == foundData) {
                candidate.push(i);
            }
        }
    }
    return candidate;
}

/**
 * A basic table that supports CRUD operations in place.
 */
class Table {
    constructor(name, init) {
        this.name = name;
        this.data = init? init : [];
    }

    /**
     * Reading from the table by query and return
     * the corresponding data. If query is an empty
     * object all the data will be returned.
     * 
     * @param {Object} query Query object
     */
    read(query) {
        return parseQuery(this.data, query);
    }

    /**
     * Insert new document(object) into the table.
     * 
     * @param {Object} document New document
     */
    insert(document) {
        this.data.push(document);
    }

    /**
     * Update the data that matched the query. If the
     * query has key like `{key.A.B: "someValue"}`, the
     * update will not affect the existing fields, but if
     * the query is `{key: {A: {B: "someValue"}}}`, the
     * existing fields will be replaced.
     * 
     * @param {Object} query Query object
     * @param {Object} update Update object
     */
    update(query, update) {
        const found = parseQuery(this.data, query);
        const candidate = findCandidateIndex(this.data, found);
        for(var i=0;i<candidate.length;i++) {
            mergeDiff(this.data[candidate[i]], update, true);
        }
    }

    /**
     * Delete all data that match the query, if the query
     * is empty all data will be deleted.
     * 
     * @param {Object} query Query object
     */
    delete(query) {
        const found = parseQuery(this.data, query);
        const candidate = findCandidateIndex(this.data, found);
        for(var i=candidate.length-1;i>=0;i--) {
            this.data.splice(candidate[i], 1);
        }
    }
}

module.exports = {
    BasicTable: Table,
}