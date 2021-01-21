//import { terser } from 'rollup-plugin-terser';
import glsl from 'rollup-plugin-glsl';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
const path = require('path')
const fs = require('fs');
//const rollupPluginTypescriptPathMapping = require('rollup-plugin-typescript-path-mapping')
const production = !process.env.ROLLUP_WATCH;


function baseUrl(options){
	let compilerOptions = JSON.parse(fs.readFileSync('tsconfig.json')).compilerOptions
	baseUrl=compilerOptions.baseUrl;

	function isRelativeModuleId(id) {
		return /^\.+\//.test(id)
	}	
    return {
        resolveId: function (id, importer) {
			// 为了避免重复加载，需要全部转换为绝对路径
			// 否则不同的id对应同一个文件，rollup不能正确处理，会出 class Laya ... class Laya$ ...
			if (isRelativeModuleId(id)){
				if(importer){
					// 一旦要自己返回自己的id，就要变成rollup能理解的路径，例如绝对路径或者相对这个文件的路径，而且有正确的扩展名
					let idf = path.join(path.dirname(importer),id);
					if(path.extname(id)=='')
						return idf+'.js'
					}
				return null;
			}
			else  {
				if(id=='tslib')	// 不知道为什么有这个
					return null;
				//importfile = path.join(scriptdir, baseUrl, id);
				let importfile = path.join( baseUrl, id+'.js');	// 加上baseurl，返回一个相对路径
				return importfile;
			}
        }
    }
}

export default { 
    input: './bin/js/layaphy.js',
    treeshake: false,
	output: {
		file: './bin/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: false,
		name:'Laya',
		globals:{'@tensorflow/tfjs': 'tf'},
        //intro:'window.Laya=window.Laya||exports||{};\n',
        //outro:layaexpreplace
        //indent: false
	},
	external:['@tensorflow/tfjs'],
	plugins: [
		baseUrl(),
        //testPlug(),
        glsl({
			// By default, everything gets included
			include: /.*(.glsl|.vs|.fs)$/,
			sourceMap: false
		}),        
		resolve(), // tells Rollup how to find date-fns in node_modules
		commonjs(), // converts date-fns to ES modules
		//production && terser() // minify, but only in production
	]
};