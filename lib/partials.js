var _ = require('lodash'),
	fs = require('fs');

var LINE_END = '\n';

module.exports = function(params){
	params = params || {};
	var dfaults = {
		delimiter: '## ',
		validFileTypes: ['html'],
		commentStartDelimiter: '!##',
		commentEndDelimiter: '##!'
	};

	var lodashParams = _.extend(_.templateSettings, (params.lodashParams || {}));

	var options = _.extend(dfaults, params);

	// global, multi-line search
	var delimiterReg = new RegExp('^(' + options.delimiter + '[\sa-zA-Z_-]+)', 'mg');
	var commentStartReg = new RegExp('^' + options.commentStartDelimiter, 'mg');
	var commentEndReg = new RegExp(options.commentEndDelimiter + '$', 'mg');


	var parseDirectory = function(dirPath, templateRoot, listRef){
		_.each(fs.readdirSync(dirPath), function(file, index){
			var filePath = dirPath + '/' + file;
			
			if(fs.statSync(filePath).isDirectory()){
				parseDirectory(filePath, templateRoot, listRef);
			} else {
				listRef.push(filePath);
			}
		});
	};

	var parseFile = function(fileName, templateRoot, filesMap, delimiter, commentDelimiter){
		var fileContents = fs.readFileSync(fileName).toString();
		var fileLines = fileContents.split('\n');


		var partials = fileContents.match(delimiterReg);
		var linePosition = 0;
		debugger;
		_.each(partials, function(partial, lineNum){
			var nextPartial;
			var currentTemplate = '';

			if(lineNum < partials.length - 1){
				nextPartial = partials[lineNum + 1];
			}
			
			// if the line is the partial identifier, move to the nextPartial line
			if(fileLines[linePosition] == partial){
				linePosition++;
			}

			var commentBlock = false;
			while(linePosition < fileLines.length){
				// if the current line is the nextPartial partial identifier, break
				if(fileLines[linePosition] == nextPartial){
					break;
				} else {

					if(!!fileLines[linePosition].match(commentStartReg)){
						commentBlock = true;
					}

					// add the line to the current partial string
					if(!commentBlock && fileLines[linePosition].length){
						currentTemplate += fileLines[linePosition] + LINE_END;
					}

					if(!!fileLines[linePosition].match(commentEndReg)){
						commentBlock = false;
					}
				}
				debugger;
				linePosition++;
			}

			// Partial name is: <file name>/<partial name>
			// The file name however, can be multiple directories deep
			var fileParts = fileName.split('.');
			var filePartsMinusExtension = fileParts.slice(0, fileParts.length - 1);
			var path = filePartsMinusExtension.join('.').replace(templateRoot + '/', '');
			var partialTemplateName = partial.replace(new RegExp(delimiter), '').replace(templateRoot.replace(/^\//, '') + '/', '');
			var partialName =  path + '/' + partialTemplateName;
			
			filesMap[partialName] = _.template(currentTemplate, null, lodashParams);
		});
	};

	var readFiles = function(files, templateRoot, filesMap, delimiter, commentDelimiter){		
		_.each(files, function(file, index){
			var splitFile = file.split('.');
			if(_.indexOf(options.validFileTypes, splitFile[splitFile.length - 1]) >= 0){
				parseFile(file, templateRoot, filesMap, delimiter, commentDelimiter);
			}
		});
	};

	var compile = function(templatePath){
		var fileList = [];
		var filesMap = {};

		parseDirectory(templatePath, templatePath, fileList);
		readFiles(fileList, templatePath, filesMap, options.delimiter, options.commentDelimiter);

		return filesMap;
	};

	var serializeTemplates = function(templates){
		var viewString = 'var __views = {};' + LINE_END;

		_.each(templates, function(template, name){
			viewString += '__views["' + name + '"] = ' + (template.source + LINE_END);
		});

		return viewString;
	};

	this.compile = compile;
	this.serializeTemplates = serializeTemplates;

	return _.extend(this, {
		compile: compile,
		serializeTemplates: serializeTemplates
	});
};

