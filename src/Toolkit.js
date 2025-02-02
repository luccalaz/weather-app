/**
 * Generates a random integer between the specified low (inclusive) and high (inclusive) values.
 *
 * @param {number} [low=1] - The lower bound of the random number range (inclusive).
 * @param {number} [high=10] - The upper bound of the random number range (inclusive).
 * @returns {number} A random integer between the specified low and high values.
 */
function getRandom(low=1, high=10) {
    let randomNumber;
    // calculate random number
    randomNumber = Math.round(Math.random() * (high - low)) + low;
    // returning value
    return randomNumber;
}

/**
 * Adds an event listener for a specified key press and calls a provided function when the key is pressed.
 *
 * @param {Function} functionToCall - The function to call when the specified key is pressed.
 * @param {string} [keyToDetect="Enter"] - The key to detect. Defaults to "Enter".
 */
function addKey(functionToCall, keyToDetect = "Enter") {
    document.addEventListener("keydown", (e) => {
        // is the key released the specified key?
        if (e.code === keyToDetect) {
            // pressing the enter key will force some browsers to refresh
            // this command stops the event from going further
            e.preventDefault();
            // call provided callback to do everything else that needs to be done
            functionToCall();
            // this also helps the event from propagating in some older browsers
            return false;
        }
    });
}

/**
 * Fetches JSON data from a given URL and handles success and failure cases.
 *
 * @param {string} retrieveURL - The URL to fetch the JSON data from.
 * @param {function} success - The callback function to handle the successful retrieval of data.
 * @param {function} failure - The callback function to handle any errors that occur during the fetch.
 * @param {boolean} [debug=true] - Optional. If true, rethrows the error after calling the failure callback. Default is true.
 */
function getJSONData(retrieveURL, success, failure, debug = true) {
    fetch(retrieveURL)
        .then(response => response.json())
        .then(data => success(data))
        .catch(error => {
            failure(error);
            if (debug) throw error;
        });
} 

class StorageManager {
    write(key, value) {
        window.localStorage.setItem(key, value);
    }
    
    read(key) {
        return window.localStorage.getItem(key);
    }
}

export { getRandom, addKey, getJSONData, StorageManager};