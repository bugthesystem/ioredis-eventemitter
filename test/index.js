process.env.NODE_ENV = 'test';

var redis = require('./../index');
var assert = require('assert');

var testsMissing = 0;
var expectCall = function (f) {
    testsMissing++;

    var count = 1;
    return function () {
        testsMissing--;
        assert(count-- >= 0);
        f.apply(null, arguments);
    };
};

var PUBSUB = redis({host: '172.17.0.1'});

var hubPrefixPUBSUB = redis({
    prefix: 'foo:',
    host: '172.17.0.1'
});

/* Standard tests */
PUBSUB.on('testSimple', expectCall(function (channel, msg) {
    assert(channel == 'testSimple');
    assert(msg === 'ok');
}));

PUBSUB.on('*:testGlobBefore', expectCall(function (channel, msg) {
    assert(channel === 'foo:testGlobBefore');
}));

PUBSUB.on('testGlobAfter:*', expectCall(function (channel, msg) {
    assert(channel === 'testGlobAfter:foo');
}));

PUBSUB.once('testOnce', expectCall(function () {
}));

PUBSUB.on('testSeveralArgs', expectCall(function (channel, msg1, msg2) {
    assert(msg1 === 'okA');
    assert(msg2 === 'okB');
}));

PUBSUB.on('testJson', expectCall(function (channel, json) {
    assert(json.msg === 'ok');
}));

PUBSUB.on('testTwoListeners', expectCall(function () {
}));
PUBSUB.on('testTwoListeners', expectCall(function () {
}));


/* Test prefix */
PUBSUB.on('*testPrefixed', expectCall(function (channel, msg) {
    assert(channel === 'foo:testPrefixed');
}));
hubPrefixPUBSUB.on('testPrefixed', expectCall(function (channel, msg) {
    assert(channel === 'testPrefixed');
}));

/* Test callback */
PUBSUB.on('testCallbackNoArgs', expectCall(function (channel, msg) {
    assert(channel === 'testCallbackNoArgs');
    assert(!msg);
}));
PUBSUB.on('testCallbackAndArgs', expectCall(function (channel, msg) {
    assert(channel === 'testCallbackAndArgs');
    assert(msg === 'testArg');
}));

/* Test error handling */
PUBSUB.on('anerror', expectCall(function () {
    throw new Error('an error');
}));
process.once('uncaughtException', function (err) {
    if (err.message !== 'an error') return console.log(err.message, err.stack);
    assert(err.message === 'an error');
});


PUBSUB.flush(function () {
    PUBSUB.emit('testSimple', 'ok');
    PUBSUB.emit('foo:testGlobBefore', 'ok');
    PUBSUB.emit('testGlobAfter:foo', 'ok');
    PUBSUB.emit('testOnce', 'ok');
    PUBSUB.emit('testOnce', 'ok');
    PUBSUB.emit('testSeveralArgs', 'okA', 'okB');
    PUBSUB.emit('testJson', {msg: 'ok'});
    PUBSUB.emit('testTwoListeners');

    hubPrefixPUBSUB.emit('testPrefixed', 'ok');

    PUBSUB.emit('anerror');

    PUBSUB.emit('testCallbackNoArgs', expectCall(function (err, num) {
        assert(!err);
        assert(num === 1);
    }));
    PUBSUB.emit('testCallbackAndArgs', 'testArg', expectCall(function (err, num) {
        assert(!err);
        assert(num === 1);
    }));
    PUBSUB.emit('testCallbackNoSub', expectCall(function (err, num) {
        assert(!err);
        assert(num === 0);
    }));
});

setTimeout(function () {
    assert(!testsMissing);
    PUBSUB.close();
    hubPrefixPUBSUB.close();
}, 2000);

setTimeout(function () {
    // Check to see if .close() works
    process.exit(1);
}, 5000).unref();
