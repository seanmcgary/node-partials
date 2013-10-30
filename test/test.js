var path = require('path');
var partials = require('../index');
var _ = require('underscore');

var templatePath = path.normalize(__dirname + '/templates');

partials = new partials();

var templates = partials.compile(templatePath);
var serializedTemplates = partials.serializeTemplates(templates);


console.log(_.keys(templates));
console.log(serializedTemplates);
