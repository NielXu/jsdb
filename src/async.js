/**
 * Wrap a result in promise way, it means that the result
 * is already been returned when wrapping, but only return
 * after certain amount of delay. The result will be returned
 * after the delay, or undefined if there is no result.
 * 
 * @param {Object} result The actual result
 * @param {Number} delay The delay time in ms, default is 0
 */
function promiseWrap(result, delay=0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(result);
        }, delay);
    });
};

/**
 * Wrap a result in callback way, it means that the result
 * is already been returned when wrapping, but only return
 * after certain amount of delay. The result will be passed
 * as an argument of the callback function, or undefined
 * if there is no result.
 * 
 * @param {Object} result The actual result
 * @param {Function} callback Callback function after delay
 * @param {Number} delay The delay time in ms, default is 0
 */
function callbackWrap(result, callback, delay=0) {
    setTimeout(() => {
        callback(result);
    }, delay);
};

module.exports = {
    promiseWrap: promiseWrap,
    callbackWrap: callbackWrap,
}
