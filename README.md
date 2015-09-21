# ioredis-eventemitter
Redis pubsub using an event emitter via ioredis Redis client

> [ioredis](https://github.com/luin/ioredis) is a robust, performance-focused and full-featured Redis client for Node and io.js.  

_This work based on [redis-eventemitter](https://github.com/freeall/redis-eventemitter)_

##Install  
```js
	npm install ioredis-eventemitter
```

## Usage

**pub/sub clients must be compatible [ioredis](https://github.com/luin/ioredis)**

```js
var redis = require('ioredis-eventemitter');

var pubsub = redis({
	port: 6379,
	host: '127.0.0.1',
	prefix: 'production:',
	password: 'mypassword'
	// in case you want to control Redis clients
	// creation you can specify pub/sub clients pair:
	// pub: pubClient,
	// sub: subClient
});

// Listen for messages on the *:newuser channel
pubsub.on('*:newuser', function(channel, user) {
	console.log(channel); // prints "myservice:newuser"
	console.log(user);    // user is a json map as expected
});

// Publish an event "production:myservice:newuser" to the redis pubsub
pubsub.emit('myservice:newuser', { id:'a1b2c3', email:'foo@example.com' });
```

## API

### .emit(channel, messages...) [publish]

``` js
var redis = require('ioredis-eventemitter');
var pubsub = redis({ prefix: 'production:' });

pubsub.emit('myservice:newuser', { id:'a1b2c3' });
```

### .on(pattern, function(channel, messages...) { ... }) [subscribe]

``` js
var redis = require('ioredis-eventemitter');
var pubsub = redis({ prefix:'production:' });

pubsub.on('*:newuser', function(channel, message) {
	console.log(channel); // myservice:newuser
	console.log(message); // { id:'a1b2c3' }
});
```

### .on('error', function(err) { ... }) [error handling]

To be able to handle errors (like when the redis server is down) `.on('error', ...)` should be used.

Note that this means that you can't listen for messages on the `error` channel.

### .removeListener(pattern, listener)

Removes listener.

### .removeAllListeners(pattern)

Removes all listeners.

## Options

### port

Port for the redis server. Defaults to 6379.

### host

Host for the redis server. Defaults to 127.0.0.1.

### password

Password for the redis server. Defaults to not being set.

### prefix

A prefix that is added to the channel name, when publishing events to the redis pubsub. Useful for separating services or environments, e.g. `production`, `development`, and `staging`.

It is also removed when the listeners is invoked.

### pub

[ioredis](https://github.com/luin/ioredis) compatible Redis client instance used for `publish`.

### sub

[ioredis](https://github.com/luin/ioredis) compatible Redis client instance used for `subscribe`.
