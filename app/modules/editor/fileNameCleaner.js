/* Copied from Tripwire */
module = module.exports;

var replaceUnderscoreWithDash = function(name){
	return name.replace(/_/g,'-');   
};

var replaceSpaceWithDash = function(name){
	return name.replace(/\s/g,'-');   
};

var stripOrderingNumbers = function(name){

	var nameParts = name.split('_');

	if(nameParts.length > 0 && !isNaN(nameParts[0])){
		nameParts.shift();
		name = nameParts.join('_');
	}

	if(name[0] === '~'){
		name = name.substring(1);
	}

	return name;
};

module.clean = function(fileName){
	fileName = stripOrderingNumbers(fileName);
	fileName = replaceSpaceWithDash(fileName);
	fileName = replaceUnderscoreWithDash(fileName);
	return fileName;
};