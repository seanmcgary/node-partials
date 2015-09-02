var reporter = require('nodeunit').reporters.default;

setTimeout(function(){
	var testOrder = [
		'test/tests/partials.js'
	];

	reporter.run(testOrder, {
		"error_prefix": "\u001B[31m",
		"error_suffix": "\u001B[39m",
		"ok_prefix": "\u001B[32m",
		"ok_suffix": "\u001B[39m",
		"bold_prefix": "\u001B[1m",
		"bold_suffix": "\u001B[22m",
		"assertion_prefix": "\u001B[35m",
		"assertion_suffix": "\u001B[39m"
	}, function(){

	});
}, 2000);