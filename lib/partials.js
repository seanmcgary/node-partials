var _ = require('lodash'),
	fs = require('fs');

var LINE_END = '\n';


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
	var self = this;
	var fileContents = fs.readFileSync(fileName).toString();
	var fileLines = fileContents.split(/\r?\n/);


	var partials = fileContents.match(self.delimiterReg);
	var linePosition = 0;

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

				if(!!fileLines[linePosition].match(self.commentStartReg)){
					commentBlock = true;
				}

				// add the line to the current partial string
				if(!commentBlock && fileLines[linePosition].length){
					currentTemplate += fileLines[linePosition] + LINE_END;
				}

				if(!!fileLines[linePosition].match(self.commentEndReg)){
					commentBlock = false;
				}
			}
			linePosition++;
		}

		// Partial name is: <file name>/<partial name>
		// The file name however, can be multiple directories deep
		var fileParts = fileName.split('.');
		var filePartsMinusExtension = fileParts.slice(0, fileParts.length - 1);
		var path = filePartsMinusExtension.join('.').replace(templateRoot + '/', '');
		var partialTemplateName = partial.replace(new RegExp(delimiter), '').replace(templateRoot.replace(/^\//, '') + '/', '');
		var partialName =  path + '/' + partialTemplateName;
		
		filesMap[partialName] = _.template(currentTemplate, null, self.lodashParams);
	});
};

var readFiles = function(files, templateRoot, filesMap, delimiter, commentDelimiter){
	var self = this;

	_.each(files, function(file, index){
		var splitFile = file.split('.');
		if(_.indexOf(self.validFileTypes, splitFile[splitFile.length - 1]) >= 0){
			parseFile.apply(self, [file, templateRoot, filesMap, delimiter, commentDelimiter]);
		}
	});
};

function Partials(params){
	var self = this;
	params = params || {};

	var dfaults = {
		delimiter: '## ',
		validFileTypes: ['html'],
		commentStartDelimiter: '!##',
		commentEndDelimiter: '##!'
	};

	self.lodashParams = _.merge(_.cloneDeep(_.templateSettings), (params.lodashParams || {}));

	var options = _.merge(dfaults, params);

	if(!options.templatePath){
		throw new Error('templatePath is required');
	}

	// global, multi-line search
	self.templatePath = options.templatePath;
	self.delimiter = options.delimiter;
	self.commentDelimiter = options.commentDelimiter;
	self.validFileTypes = options.validFileTypes;
	self.delimiterReg = new RegExp('^(' + options.delimiter + '[\sa-zA-Z0-9_\/-]+)', 'mg');
	self.commentStartReg = new RegExp('^' + options.commentStartDelimiter, 'mg');
	self.commentEndReg = new RegExp(options.commentEndDelimiter + '$', 'mg');

	self.compile();
	self.serializeTemplates();
};

Partials.prototype.compile = function(){
	var self = this;

	var fileList = [];
	var filesMap = {};

	parseDirectory(self.templatePath, self.templatePath, fileList);
	readFiles.apply(self, [fileList, self.templatePath, filesMap, self.delimiter, self.commentDelimiter]);

	self.compiledTemplates = filesMap;
	return self.compiledTemplates;
};

Partials.prototype.serializeTemplates = function(){
	var self = this;

	var viewString = 'var __views = {};' + LINE_END;

	_.each(self.compiledTemplates, function(template, name){
		viewString += '__views["' + name + '"] = ' + (template.source + LINE_END);
	});

	self.serializedTemplates = viewString;
	return self.serializedTemplates;
};

Partials.prototype.getCompiledTemplates = function(){
	return this.compiledTemplates;
};

Partials.prototype.getSerializedTemplates = function(){
	return this.serializedTemplates || '';
};

module.exports = Partials;

