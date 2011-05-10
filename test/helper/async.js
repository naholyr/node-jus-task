const assert = require('assert');
const path = require('path');

const helper = require('../../lib/helper');

var dir = 'test1/test2/test3';
var file = 'touched.file';

helper.logSection('test', 'helper / filesystem / async');

// File
helper.touch(file, onTouch1);
function onTouch1(err) { assert.ok(!err); helper.exists(file, onExist1); }
function onExist1(err, exists) { assert.ok(exists); helper.unlink(file, onUnlink1); }
function onUnlink1(err) { assert.ok(!err); helper.exists(file, onExist2); }
function onExist2(err, exists) { assert.ok(!exists); }

// Dir
helper.mkdir(dir, onMkdir);
function onMkdir(err) { assert.ok(!err); helper.exists(dir, onExist3); }
function onExist3(err, exists) { assert.ok(exists); helper.touch(path.join(dir, file), onTouch2); }
function onTouch2(err) { assert.ok(!err); helper.exists(path.join(dir, file), onExist4); }
function onExist4(err, exists) { assert.ok(exists); helper.unlink(path.join(dir, file), onUnlink2); }
function onUnlink2(err) { assert.ok(!err); helper.rmdir(path.dirname(dir), onRmdir1); }
function onRmdir1(err) { assert.ok(err); helper.rmdir(dir, onRmdir2); }
function onRmdir2(err) { assert.ok(!err); helper.exists(dir, onExist5); }
function onExist5(err, exists) { assert.ok(!exists); helper.rmdir(path.dirname(dir), onRmdir3); }
function onRmdir3(err) { assert.ok(!err); helper.exists(path.dirname(dir), onExist6); }
function onExist6(err, exists) { assert.ok(!exists); helper.rmdir(path.dirname(path.dirname(dir)), onRmdir4); }
function onRmdir4(err) { assert.ok(!err); helper.exists(path.dirname(path.dirname(dir)), onExist7); }
function onExist7(err, exists) { assert.ok(!exists); }
