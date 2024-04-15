module.exports = function (time, iat) {
    let timestamp = iat || Math.floor(Date.now() / 1000);

    if (typeof time === 'number') {
        return timestamp + time;
    } else {
        return;
    }

};