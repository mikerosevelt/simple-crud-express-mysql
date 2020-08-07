const fs = require('fs');
const path = require('path');

/**
 * @description Prevent overwriting file name
 * @param {*} filename: String
 */
const preventOverwrite = (filename) => {
	let i = 0;
	while (fs.existsSync(`${process.env.FILE_UPLOAD_PATH}/${filename}`)) {
		i++;
		filename = `${path.parse(filename).name}-${i}${path.parse(filename).ext}`;
	}
	return filename;
};

module.exports = preventOverwrite;
