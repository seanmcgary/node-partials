var path = require('path');
var partials = require('../index');
var _ = require('underscore');

var templatePath = path.normalize(__dirname + '/templates');

partials = new partials();

console.log(partials);

var templates = partials.compile(templatePath);

_.each(templates, function(tmpl){
	console.log(tmpl());
	console.log('--------\n\n');
});
