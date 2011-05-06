module.exports = new (require('../index').Task)({
  "namespace": "task",
  "name": "list",
  "aliases": ["list"],
  "execute": function(opts, args) {
    console.log(opts, args);
  },
  "configure": function() {
    this.addArgument({"name":'toto', "default":'coucou'});
  }
});
