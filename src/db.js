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
 * The normal database that can perform CRUD
 * operations but it is mutable, which means
 * it will modify the original data passed from
 * the constructor.
 */
class Database {
    constructor() {
        this.data = {};
        this.using = null;
    }

    /**
     * Create a new table with given name.
     * 
     * @param {String} tableName Name of the new table
     * @param {Object} init The initial data be passed in the table, optional
     */
    create(tableName, init) {
        if(this.data.hasOwnProperty(tableName)) {
            throw `Table with name "${tableName}" already exists`;
        }
        this.data[tableName] = init? init : [];
    }

    /**
     * Use a table, if no table was selected before
     * querying, exception will be raised.
     * 
     * @param {String} tableName Name of the table
     */
    use(tableName) {
        if(!this.data.hasOwnProperty(tableName)) {
            throw `Table with name "${tableName}" does not exists`;
        }
        this.using = tableName;
    }

    /**
     * List all the table names, return a list of strings
     */
    list() {
        let names = [];
        for(var key in this.data) {
            names.push(key);
        }
        return names;
    }

    /**
     * Insert new document(object) into the
     * database.
     * 
     * @param {Object} document New document
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    insert(document, tableName) {
        this.data[this._checkUse(tableName)].push(document);
    }

    /**
     * Reading from the database by query and return
     * the corresponding data. If query is an empty
     * object all the data will be returned.
     * 
     * @param {Object} query Query object
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    read(query, tableName) {
        return parseQuery(this.data[this._checkUse(tableName)], query);
    }

    /**
     * Update the data that matched the query. It the
     * query has key like `{key.A.B: "someValue"}`, the
     * update will not affect the existing fields, but if
     * the query is `{key: {A: {B: "someValue"}}}`, the
     * existing fields will be replaced.
     * 
     * @param {Object} query Query object
     * @param {Object} update Update object
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    update(query, update, tableName) {
        const data = this.data[this._checkUse(tableName)];
        const found = parseQuery(data, query);
        const candidate = findCandidateIndex(data, found);
        for(var i=0;i<candidate.length;i++) {
            mergeDiff(data[candidate[i]], update, true);
        }
    }

    /**
     * Delete all data that match the query, if the query
     * is empty all data will be deleted.
     * 
     * @param {Object} query Query object
     * @param {String} tableName Table to use, this will ignore the current selection
     * of the database, it is not recommended to use
     */
    delete(query, tableName) {
        const data = this.data[this._checkUse(tableName)];
        const found = parseQuery(data, query);
        const candidate = findCandidateIndex(data, found);
        for(var i=candidate.length-1;i>=0;i--) {
            data.splice(candidate[i], 1);
        }
    }

    /**
     * Internal function, check the current use of table, return
     * a correct table name or raise exception if error occured
     * 
     * @param {String} tableName Optional tableName
     */
    _checkUse(tableName) {
        let table;
        if(tableName) {
            if(!this.data.hasOwnProperty(tableName)) {
                throw `Table with name "${tableName}" does not exists`;
            }
            table = tableName;
        }
        else {
            if(!this.using) {
                throw "No table is selected";
            }
            table = this.using;
        }
        return table;
    }
}

module.exports = {
    BasicDatabase: Database
}