const { parseQuery } = require('./query');

/**
 * The normal database that can perform CRUD
 * operations but it is mutable, which means
 * it will modify the original data passed from
 * the constructor.
 */
class Database {
    constructor(init) {
        this.data = init? init : [];
    }

    /**
     * Insert new document(object) into the
     * database.
     * 
     * @param {Object} document New document
     */
    insert(document) {
        this.data.push(document);
    }

    /**
     * Reading from the database by query and return
     * the corresponding data. If query is an empty
     * object all the data will be returned.
     * 
     * @param {Object} query Query object
     */
    read(query) {
        return parseQuery(this.data, query);
    }

    update(query, update) {

    }

    delete(query) {

    }
}

module.exports = {
    BasicDatabase: Database
}