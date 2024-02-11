const today = require('../utils/today');

function log(message, data) {
    console.log("==============================");
    console.log(today.toDateTime());
    console.log(message);
    if (data != null) {
        console.log(data);
    }
    console.log("==============================");
}

module.exports = {log}