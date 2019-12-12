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

    insert(document) {
        this.data.push(document);
    }

    read(query) {
        
    }

    update(query, update) {

    }

    delete(query) {

    }
}

module.exports = {
    BasicDatabase: Database
}