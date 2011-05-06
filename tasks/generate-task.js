module.exports = new (require('../index').Task)({
  "namespace": "task",
  "name": "generate",
  "aliases": ["gen-task"],
  "execute": function(opts, args) {
    console.log(args);
  }
});
