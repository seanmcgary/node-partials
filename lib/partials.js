var _ = require('underscore'),
	fs = require('fs');

var LINE_END = '\n';

var parseDirectory = function(dirPath, templateRoot, listRef){
	var dirFiles = fs.readdirSync(dirPath);
	_.each(dirFiles, function(file, index){
		var filePath = dirPath + '/' + file;
		var fileStat = fs.statSync(filePath);
		
		if(fileStat.isDirectory()){
			parseDirectory(filePath, templateRoot, listRef);
		} else {
			listRef.push(filePath);
		}
	});
};

var parseFile = function(file, templateRoot, filesMap, delimiter){
	console.log("PARSE FILE");
	console.log(arguments);
	var fileContents = fs.readFileSync(file).toString();
		
	var fileLines = fileContents.split('\n');
	var partialMatcher = new RegExp('^' + delimiter + '\s*(.*)$', 'mg');
	var partials = fileContents.match(partialMatcher);
	console.log(partials);
	console.log(fileContents);
	
	var currentTemplate = '';
	var filePosition = 0;

	_.each(partials, function(partial, fileIndex){
		var next;

		if(fileIndex < partials.length - 1){
			next = partials[fileIndex + 1];
		}
		
		if(fileLines[filePosition] == partial){
			filePosition++;
		}

		while(filePosition < fileLines.length){
			if(fileLines[filePosition] == next){
				break;
			} else {
				currentTemplate += fileLines[filePosition] + LINE_END;
			}

			filePosition++;
		}

		var partialName = file.split('.')[0].replace(/\//, '') + '/' + partial.replace(delimiter + ' ', '');
		partialName = partialName.replace(templateRoot.replace(/^\//, '') + '/', '');

		filesMap[partialName] = _.template(currentTemplate);
	});
};

var readFiles = function(files, templateRoot, filesMap, delimiter){
	
	_.each(files, function(file, index){
		// TODO - check to make sure files are correct type here
		parseFile(file, templateRoot, filesMap, delimiter);
	});
};

var compile = function(templatePath){
	var viewString = 'var __views = {};' + LINE_END;
	
	var fileList = [];
	var filesMap = {};

	parseDirectory(templatePath, templatePath, fileList);
	readFiles(fileList, templatePath, filesMap, this.options.delimiter);


	return filesMap;
};

module.exports = function(params){
	params = params || {};
	var dfaults = {
		delimiter: '##'
	};

	this.options = _.extend(dfaults, params);
	this.compile = compile;
	
	return this;
};

