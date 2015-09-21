var path = require('path');
var _partials = require('../index');
var _ = require('lodash');

var templatePath = path.normalize(__dirname + '/templates');
console.log(templatePath);
partials = new _partials({
	templatePath: templatePath
});

console.log(partials);


