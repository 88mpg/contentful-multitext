const fs = require('fs');
const version = require('./package.json').version;

const config = {
	id: 'multitext',
	name: 'Song Field',
	src: `https://unpkg.com/contentful-song-field@${version}`,
	fieldTypes: ['Object'],
};

fs.writeFileSync('./extension.json', JSON.stringify(config, null, '\t') + '\n');
