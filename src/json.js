const fs = require('fs');
const path = require('path');

/**
 * Export an object to JSON file, save it to given
 * location with given name. Create new file if the
 * JSON file does not exists, updating the existing
 * one otherwise.
 * 
 * @param {Object} obj The object to be exported
 * @param {String} p The path to save the object
 * @param {String} name Name of the JSON file
 */
function exportObject(obj, p, name) {
    if(typeof obj !== 'object') {
        throw `Unsupported object type: ${typeof obj}`;
    }
    if(!fs.existsSync(p)) {
        throw `Path not found: ${p}`;
    }
    fs.writeFileSync(
        path.resolve(p, name.includes(".json")? name : `${name}.json`),
        JSON.stringify(obj, null, 2),
        "utf-8"
    );
}

/**
 * Reading an object from the JSON file
 * 
 * @param {String} p The path to the object
 * @param {String} name Name of the JSON file
 */
function importObject(p, name) {
    const jsonPath = path.resolve(p, name.includes(".json")? name : `${name}.json`);
    if(!fs.existsSync(jsonPath)) {
        throw `JSON file does not exists ${jsonPath}`;
    }
    return JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
}

module.exports = {
    exportObject: exportObject,
    importObject: importObject,
};
