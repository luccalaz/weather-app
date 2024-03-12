// randomly generates a number between the range of low and high
// arguments :
// low : number - the lowest number in the range
// high : number - the highest number in the range
function getRandom(low=1, high=10) {
    let randomNumber;
    // calculate random number
    randomNumber = Math.round(Math.random() * (high - low)) + low;
    // returning value
    return randomNumber;
}

// adds key event listener to any key and runs a function when that key is pressed
// arguments :
// functionToCall : function - the function to call when the key is pressed
// keyToDetect : string - the key to detect
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

// retrieves JSON data from a URL and runs a function when the data is retrieved, passing along the JSON data as an argument
// arguments :
// retrieveURL : string - the URL to retrieve the JSON data from
// success : function - the function to call when the data is retrieved
// failure : function - the function to call when the data is not retrieved and an error occurs
// debug : boolean - whether to throw an error if one occurs (default is set to true)
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