var path = require('path');
var _partials = require('../index');
var _ = require('underscore');

var templatePath = path.normalize(__dirname + '/templates');
console.log(templatePath);
partials = new _partials();

var templates = partials.compile(templatePath);
var serializedTemplates = partials.serializeTemplates(templates);


console.log(_.keys(templates));
console.log(serializedTemplates);

var templateSettings = {
	interpolate: /<%=([\s\S]+?)%>/g,
	evaluate: /<%([\s\S]+?)%>/g
};
var lodashPartials = new _partials({
	lodashParams: templateSettings
});

templates = lodashPartials.compile(templatePath);

console.log(templates);

console.log(templates['lodashTest/test']({ foobar: 'test string' }));


