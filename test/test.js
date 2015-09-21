var path = require('path');
var _partials = require('../index');
var _ = require('lodash');

var templatePath = path.normalize(__dirname + '/templates/deepPartials');

partials = new _partials({
	templatePath: templatePath
});

var templates = partials.getCompiledTemplates();

console.log(templates);


