var _ = require('lodash'),
	fs = require('fs');

var LINE_END = '\n';

module.exports = function(params){
	params = params || {};
	var dfaults = {
		delimiter: '## ',
		validFileTypes: ['html']
	};

	var lodashParams = _.extend(_.templateSettings, (params.lodashParams || {}));

	var options = _.extend(dfaults, params);

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

	var parseFile = function(file, templateRoot, filesMap, delimiter){
		var fileContents = fs.readFileSync(file).toString(),
			fileLines = fileContents.split('\n'),
			partials = fileContents.match(new RegExp('^' + delimiter + '*(.*)$', 'mg')),
			filePosition = 0;


		_.each(partials, function(partial, fileIndex){
			var next,
				currentTemplate = '';

			if(fileIndex < partials.length - 1){
				next = partials[fileIndex + 1];
			}
			
			// if the line is the partial identifier, move to the next line
			if(fileLines[filePosition] == partial){
				filePosition++;
			}


			while(filePosition < fileLines.length){

				// if the current line is the next partial identifier, break
				if(fileLines[filePosition] == next){
					break;
				} else {
					// add the line to the current partial string
					if(fileLines[filePosition].length){
						currentTemplate += fileLines[filePosition] + LINE_END;
					}
				}

				filePosition++;
			}

			// Partial name is: <file name>/<partial name>
			// The file name however, can be multiple directories deep
			var fileParts = file.split('.');
			var filePartsMinusExtension = fileParts.slice(0, fileParts.length - 1);
			var path = (filePartsMinusExtension.join('.').replace(templateRoot + '/', ''));
			var partialTemplateName = partial.replace(new RegExp(delimiter), '').replace(templateRoot.replace(/^\//, '') + '/', '');
			var partialName =  path + '/' + partialTemplateName;
			
			filesMap[partialName] = _.template(currentTemplate, null, lodashParams);
		});
	};

	var readFiles = function(files, templateRoot, filesMap, delimiter){
		var self = this;
		
		_.each(files, function(file, index){
			
			var splitFile = file.split('.');
			if(_.indexOf(options.validFileTypes, splitFile[splitFile.length - 1]) >= 0){
				parseFile(file, templateRoot, filesMap, delimiter);
			}
		});
	};

	var compile = function(templatePath){
		var fileList = [];
		var filesMap = {};

		parseDirectory(templatePath, templatePath, fileList);
		readFiles(fileList, templatePath, filesMap, options.delimiter);


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

