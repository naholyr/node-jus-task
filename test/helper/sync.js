const assert = require('assert');
const path = require('path');

const helper = require('../../lib/helper');

var dir = 'test1/test2/test3';
var file = 'touched.file';

helper.logSection('test', 'helper / filesystem / sync');

// File
assert.doesNotThrow(function() { helper.touch(file) });
assert.ok(helper.exists(file));
assert.doesNotThrow(function() { helper.unlink(file) });
assert.ok(!helper.exists(file));

// Dir
assert.doesNotThrow(function() { helper.mkdir(dir) });
assert.ok(helper.exists(dir));
assert.doesNotThrow(function() { helper.touch(path.join(dir, file)) });
assert.ok(helper.exists(path.join(dir, file)));
assert.doesNotThrow(function() { helper.unlink(path.join(dir, file)) });
assert.throws(function() { helper.rmdir(path.dirname(dir)) }); // rmdir test1/test2 → fail
assert.doesNotThrow(function() { helper.rmdir(dir) }); // rmdir test1/test2/test3 → ok
assert.ok(!helper.exists(dir));
assert.doesNotThrow(function() { helper.rmdir(path.dirname(dir)) }); // rmdir test1/test2 → ok
assert.ok(!helper.exists(path.dirname(dir)));
assert.doesNotThrow(function() { helper.rmdir(path.dirname(path.dirname(dir))) }); // rmdir test1 → ok
assert.ok(!helper.exists(path.dirname(path.dirname(dir))));
