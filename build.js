const { registerTransforms } = require('@tokens-studio/sd-transforms');
const StyleDictionary = require('style-dictionary');
const { promises } = require('fs');
const fs = require('fs')
var setWith = require('lodash.setwith');

StyleDictionary.registerFormat({
	name: 'scss/variables',
	formatter: function(dictionary, config) {
		const header = `/**\n` +
			this.header.split('\n').map((line) => ` * ${line}`).join('\n') +
			`\n */\n`;

		return header +
			dictionary.allProperties.map((prop) => `$${prop.name}: ${prop.value};`).join('\n');
	}
});

registerTransforms(StyleDictionary, {
	excludeParentKeys: false,
});

StyleDictionary.registerFormat({
	name: 'json/docs-object',
	formatter: function(dictionary, config) {
		const obj = {}
		dictionary.allProperties.forEach((token) => {
			setWith(obj, token.path.join("."), {value: token.value, description: token.description, type: token.type}, Object)
		})
		return JSON.stringify(obj, null, 2)
	}
});

async function run() {
	const $themes = JSON.parse(await promises.readFile('./tokens/$themes.json'));
	console.log($themes)
	const configs = $themes.map(theme => ({
		source: Object.entries(theme.selectedTokenSets)
			.filter(([, val]) => val !== 'disabled')
			.map(([tokenset]) => `./tokens/${tokenset}.json`),
		platforms: {

			docs: {
				prefix: "kio",
				options: {
					"showFileHeader": false,
					"outputReferences": false
				},
				transformGroup: 'tokens-studio',
				buildPath: `build/web/${theme.name}/`,
				files: [
					{
						destination: `${theme.name}.json`,
						format: 'json/docs-object',
					},
				],
			},


			css: {
				prefix: "kio",
				options: {
					"showFileHeader": false,
					"outputReferences": false
 				},
				transforms: [
					'ts/descriptionToComment',
					'ts/size/px',
					'ts/opacity',
					'ts/size/lineheight',
					'ts/type/fontWeight',
					'ts/resolveMath',
					'ts/size/css/letterspacing',
					'ts/typography/css/shorthand',
					'ts/border/css/shorthand',
					'ts/shadow/css/shorthand',
					'ts/color/css/hexrgba',
					'ts/color/modifiers',
					'name/cti/kebab',
				],
				transformGroup: 'tokens-studio',
				buildPath: `build/web/${theme.name}/`,
				files: [
					{
						destination: `${theme.name}.css`,
						format: 'css/variables',
					},
				],
			},
				scss: {
					prefix: "kio",
					options: {
						"showFileHeader": false,
						"outputReferences": true
					},
					transforms: [
						'ts/descriptionToComment',
						'ts/size/px',
						'ts/opacity',
						'ts/size/lineheight',
						'ts/type/fontWeight',
						'ts/resolveMath',
						'ts/size/css/letterspacing',
						'ts/typography/css/shorthand',
						'ts/border/css/shorthand',
						'ts/shadow/css/shorthand',
						'ts/color/css/hexrgba',
						'ts/color/modifiers',
						'name/cti/kebab',
					],
					transformGroup: 'tokens-studio',
					buildPath: `build/web/${theme.name}/`,
					files: [
						{
							header: `@tokens Colors
							@presenter Color`,
							destination: `${theme.name}.scss`,
							format: 'scss/variables',
						},
					],
			},
		},
	}));
	console.log(JSON.stringify(configs))
	console.log('configs', configs)
	configs.forEach(cfg => {
		const sd = StyleDictionary.extend(cfg);
		sd.cleanAllPlatforms(); // optionally, cleanup files first..
		sd.buildAllPlatforms();
	});
}

function resetBuildContent(folderPath) {
	return new Promise((resolve, reject) => {
		// Check if the folder exists
		if (fs.existsSync(folderPath)) {
			// Remove the folder and its contents
			fs.rmdir(folderPath, { recursive: true }, (error) => {
				if (error) {
					reject(error);
				} else {
					resolve(`Folder '${folderPath}' and its contents have been removed.`);
				}
			});
		} else {
			resolve(`Folder '${folderPath}' does not exist.`);
		}
	});
}

// Usage example
resetBuildContent('./build')
	.then(() => {
		run();
	})
	.catch((error) => {
		console.error(error);
	});




