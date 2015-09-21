var _ = require('lodash');
var path = require('path');

var NodePartials = require('../../');
var templatePath = path.resolve(__dirname + '/../templates');

var expectedTemplates = [
	{
		key: 'deepPartials/deep/deep-partial'
	}, {
		key: 'deepPartials/deep/partial/slash'
	}, {
		key: 'dir.period/testPeriod/test-partial-1'
	}, {
		key: 'lodashTest/test'
	}, {
		key: 'partials/test-partial-1'
	}, {
		key: 'test/stuff'
	}, {
		key: 'test/javascript-init'
	}, {
		key: 'test/comment-block'
	}
];

var invalidTemplates = [
	{
		key: 'invalidTemplateFile/invalid-partial'
	}
];

module.exports = {
	setUp: function(cb){
		this.partials = new NodePartials({
			templatePath: templatePath
		});
		this.compiledTemplates = this.partials.getCompiledTemplates();

		cb();
	},
	tearDown: function(cb){
		cb();
	},
	ignoredInvalidTemplates: function(test){
		var self = this;
		test.expect(invalidTemplates.length);
		var templateKeys = _.keys(self.compiledTemplates);

		_.each(_.pluck(invalidTemplates, 'key'), function(templateName){
			test.equal(_.indexOf(templateKeys, templateName) < 0, true);
		});
		test.done();
	},
	hasExpectedTemplates: function(test){
		var self = this;
		test.expect(expectedTemplates.length);
		var templateKeys = _.keys(self.compiledTemplates);

		_.each(_.pluck(expectedTemplates, 'key'), function(templateName){
			var found = _.indexOf(templateKeys, templateName) >= 0;
			if(!found){
				console.log(templateName);
			}
			test.equal(found, true);
		});
		test.done();
	},
	testCommentBlock: function(test){
		var self = this;
		test.expect(1);

		var rendered = self.compiledTemplates['test/comment-block']();
		var expected = "herp derp do\n";
		test.equal(rendered, expected);
		test.done();

	},
	serializesTemplates: function(test){
		var self = this;

		test.expect(2);

		var templates = this.partials.getSerializedTemplates();
		test.equal(_.isString(templates), true);
		test.ok(templates.length);
		test.done();
	}
};