//import { terser } from 'rollup-plugin-terser';
const path = require('path');
const fs = require('fs');
var matched = require('matched');
const production = !process.env.ROLLUP_WATCH;


var curPackFiles=null;  //当前包的所有的文件
var mentry = 'multientry:entry-point';
function myMultiInput(){
    var include = [];
    var exclude = [];    
    function configure(config) {
        if (typeof config === 'string') {
          include = [config];
        } else if (Array.isArray(config)) {
          include = config;
        } else {
            include = config.include || [];
            exclude = config.exclude || [];
      
            if (config.exports === false) {
              exporter = function exporter(path) {
                return `import ${JSON.stringify(path)};`;
              };
            }            
        }
      }  
      
      var exporter = function exporter(path) {
        return `export * from ${JSON.stringify(path)};`;
      };
          
    return(
        {
            options(options){
                //console.log('===', options.input)
                configure(options.input);
                options.input = mentry;
            },
            
            resolveId(id, importer) {//entry是个特殊字符串，rollup并不识别，所以假装这里解析一下
                if (id === mentry) {
                  return mentry;
                }
                var importfile= path.resolve(path.dirname(importer),id);
                var ext = path.extname(importfile);
                if(ext!='.js' && ext!='.glsl' && ext!='.vs' && ext!='.ps' &&ext!='.fs'){
					importfile+='.js';
                }
                //console.log('import ', importfile);
                if( curPackFiles.indexOf(importfile)<0){
                    //其他包里的文件
                    console.log('other pack:', importfile, id ,importer);
                    return 'Laya';
                }else{
					return importfile;
				}
              },            
            load(id){
                if (id === mentry) {
                    if (!include.length) {
                      return Promise.resolve('');
                    }
            
                    var patterns = include.concat(exclude.map(function (pattern) {
                      return '!' + pattern;
                    }));
                    return matched.promise(patterns, {realpath: true}).then(function (paths) {
                        curPackFiles = paths;   // 记录一下所有的文件
                        console.log(paths);
                        fs.writeFileSync('d:/temp/pp.ts',paths.join('\n'));
                        return paths.map(exporter).join('\n');
                    });
                  }else{
                      //console.log('load ',id);
                  }
            }
        }
    );
}

export default { 
	input: [
		'./bin/js/collision/**/*.js',
		'./bin/js/constraints/**/*.js',
		'./bin/js/equations/**/*.js',
		'./bin/js/material/**/*.js',
		'./bin/js/math/**/*.js',
		'./bin/js/objects/**/*.js',
		'./bin/js/shapes/**/*.js',
		'./bin/js/solver/**/*.js',
		'./bin/js/utils/**/*.js',
		'./bin/js/world/**/*.js',
		'./bin/js/layawrap/ctrls/ArcBall.js',
		'./bin/js/layawrap/ctrls/KeyInputAction.js',
		'./bin/js/layawrap/ctrls/PositionAction.js',
		'./bin/js/layawrap/ctrls/RotationAction.js'
	],
    treeshake: false,
	output: {
		file: './build/layacannon.js',
		format: 'iife', 
		sourcemap: false,
		globals:{'Laya':'Laya'},
        name:'cannon',
		//intro:'window.Laya=window.Laya||exports||{};\n',
		//outro:layaexpreplace
		outro:'exports.version="'+(new Date())+'"'
        //indent: false
	},
	external:['Laya'],
	plugins: [
		myMultiInput()
        //testPlug(),
		//resolve(), // tells Rollup how to find date-fns in node_modules
		//commonjs(), // converts date-fns to ES modules
		//production && terser() // minify, but only in production
	]
};