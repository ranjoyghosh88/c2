var cdnConfig = require('./config/cdnConfig');
var pkg = require('./package.json');
var version = '/upload/' + pkg.version || '/upload';
/* Folder where all csquire code is placed */
var src = {
  rootFolder: './src',
  imgFolder: './src/public/images',
  jsFolder: './src/public/javascripts',
  htmlFolder: './src/public/html',
  jsLibFolder: './src/public/javascripts/lib',
  lessFolder: './src/public/less',
  lessLibFolder: './src/public/less/lib',
  adminRoutesFolder: './src/admin-routes',
  routesFolder: './src/routes',
  modelsFolder: './src/models',
  viewsFolder: './src/views',
  rfpviewsFolder: './src/public/javascripts/rfp-backbone-demo',
};

/* Folder where all csquire code will be placed during deployment */
var dest = {
  imgFolder: './public/images',
  jsFolder: './public/javascripts',
  htmlFolder: './public/',
  jsLibFolder: './public/javascripts/lib',
  cssFolder: './public/stylesheets',
  cssLibFolder: './public/stylesheets/lib',
  adminRoutesFolder: './admin-routes',
  routesFolder: './routes',
  modelsFolder: './models',
  viewsFolder: './views',
  rfpviewsFolder: './public/javascripts/rfp-backbone-demo',
};
/* Sequence of tasks that need to be done for local DEV deployment */
/* NOTE: also refer the WATCH tasks for this item */
var devTasks = [
  'jscs', 'jshint', /*'mochaTest:register',*/ 'clean',
  'copy:unchanged', 'copy:dev', 'copy:afterJSHint',
  'less:development', 'watch',
];

var devNoWatchTasks = [
  'jscs', 'jshint', /*'mochaTest:register',*/ 'clean',
  'copy:unchanged', 'copy:dev', 'copy:afterJSHint',
  'less:development',
];

/* Sequence of tasks that need to be done for QA deployment */
var qaTasks = [
  'jscs', 'jshint',
  'clean', 'copy:unchanged', 'copy:afterJSHint',
  'less:qa',
];

/* Sequence of tasks that need to be done for PRODUCTION deployment */
var prodTasks = [
  'jscs', 'jshint',
  'clean', 'copy:unchanged', 'copy:afterJSHint',
  'less:production',
];
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.registerMultiTask('uploadPublic',
   'Upload files from public to cloudinary', function() {
    var pathToRead = this.data;
    var pathToWrite = this.target;
    require('dotenv').load();
    var fs = require('fs');
    var cloudinary = require('cloudinary');
    var async = require('async');
    // Tell grunt this task is asynchronous.
    var done = this.async();
    var walk = function(dir) {
      var results = [];
      var list = fs.readdirSync(dir);
      list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
          results = results.concat(walk(file));
        } else {
          results.push(file);
        }
      });
      return results;
    };
    var uploadFiles = function(paths, cb) {
      async.each(paths, function(path, callback) {
        var opts = {};
        var opt1 = 'public_id';
        var opt2 = 'resource_type';
        opts[opt1] = pkg.version + path.replace('public/', '/admin/');
        opts[opt2] = 'raw';
        cloudinary.uploader.upload(path,
          function(res) {
            if (res.error) {
              grunt.log.writeln(path +
                 ' was not uploaded | ' + JSON.stringify(res.error));
            }
            grunt.log.writeln(res.url);
            callback(null, res);
          }, opts);
      }, cb);
    };
    var files = walk(pathToRead.src);
    uploadFiles(files, function(err, result) {
      grunt.log.writeln(result);
      grunt.log.writeln('deployed');
      done();
    });
  });

  grunt.initConfig({
    // Style checks
    // NOTE: using node-style-guide
    // To do: add specific styles for front-end JS files & JSON files
    uploadPublic: {
      build: {
        src: 'public',
        dest: 'public',
      },
    },
    jscs: {
      nodeFiles: {
        options: {
          preset: 'node-style-guide',
          config: true,
          validateLineBreaks: null,
          fix: true,
        },
        files: {
          src: [
            'gruntfile.js', 'app.js',
            'src/routes/api/auth.js', 'src/**/*.js', '!src/**/lib/**',
          ],
        },
      },
    },

    // Code checks
    // NOTE: this is different to JSCS above
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        globals: {
          require: true,
          exports: true,
          module: true,
        },
        /* Enforcing NodeJS style guide */
        /* Ref.: https://github.com/felixge/node-style-guide */
        camelcase: true,
        curly: true,
        eqeqeq: true,
        freeze: true,
        indent: 2,
        newcap: true,
        quotmark: 'single',
        maxdepth: 3,
        maxstatements: 15,
        maxlen: 80,
        eqnull: true,
        funcscope: true,
        node: true,
      },
      /* NOTE: 3rd party files in LIB are ignored */
      all: [
        'gruntfile.js', 'app.js',
        'src/**/*.js', '!src/**/lib/**/*.js',
      ],
    },

    /* Cleaning all deployed file */
    clean: {
      all: ['admin-routes', 'routes', 'views', 'models', 'public/**'],
    },

    less: {
      development: {
        options: {
          modifyVars: {
            imgCDN: '"' + cdnConfig.development.imgCDN.
            replace('/upload', version) + '"',
            jsCDN: '"' + cdnConfig.development.jsCDN + '"',
            cssCDN: '"' + cdnConfig.development.cssCDN + '"',
            bootstrapCDN: [
              '"',
              cdnConfig.development.customCDN.bootstrapCDNcss,
              '"',
            ].join(''),
            fontawesomeCDN: [
              '"',
              cdnConfig.development.customCDN.fontawesomeCDNcss,
              '"',
            ].join(''),
          },
        },
        files: {
          './public/stylesheets/screen.min.css':
 src.lessFolder + '/screen.less',
          './public/stylesheets/print.min.css':
 src.lessFolder + '/print.less',
        },
      },
      production: {
        options: {
          compress: true,
          modifyVars: {
            imgCDN: '"' + cdnConfig.production.imgCDN.
            replace('/upload', version) + '"',
            jsCDN: '"' + cdnConfig.production.jsCDN + '"',
            cssCDN: '"' + cdnConfig.production.cssCDN + '"',
            bootstrapCDN: [
              '"',
              cdnConfig.production.customCDN.bootstrapCDNcss,
              '"',
            ].join(''),
            fontawesomeCDN: [
              '"',
              cdnConfig.production.customCDN.fontawesomeCDNcss,
              '"',
            ].join(''),
          },
        },
        files: {
          './public/stylesheets/screen.min.css':
 src.lessFolder + '/screen.less',
          './public/stylesheets/print.min.css':
 src.lessFolder + '/print.less',
        },
      },
      qa: {
        options: {
          compress: true,
          modifyVars: {
            imgCDN: '"' + cdnConfig.qa.imgCDN.
            replace('/upload', version) + '"',
            jsCDN: '"' + cdnConfig.qa.jsCDN + '"',
            cssCDN: '"' + cdnConfig.qa.cssCDN + '"',
            bootstrapCDN: [
              '"',
              cdnConfig.qa.customCDN.bootstrapCDNcss,
              '"',
            ].join(''),
            fontawesomeCDN: [
              '"',
              cdnConfig.qa.customCDN.fontawesomeCDNcss,
              '"',
            ].join(''),
          },
        },
        files: {
          './public/stylesheets/screen.min.css':
 src.lessFolder + '/screen.less',
          './public/stylesheets/print.min.css':
 src.lessFolder + '/print.less',
        },
      },
    },
    watch: {
      options: {
        livereload: true,
      },
      src: {
        files: [src.rootFolder + '/**', 'app.js', 'gruntfile.js'],
        tasks: [
          'newer:jscs', 'newer:jshint', 'newer:copy:unchanged',
          'newer:copy:dev', 'newer:copy:afterJSHint', 'less:development',
        ],
      },
    },

    mochaTest: {
      options: {
        reporter: 'mocha-html-reporter',
        quiet: true,
        captureFile: '/src/test/TestResults/CSquireTestResult.html',
      },
      register: {
        src: ['src/test/**/*.js'],
      },
    },

    /* - ghostinspector: {
      options: {
        // The API key for your Ghost Inspector account
        apiKey: '80a3e7fe67c955308bf79e4458b10e2769082756',
      },
      qa: {
        // IDs of any suites to execute
        suites: ['55b9e4af9e4f1baa0316965c', '55f7d7c732b3decb74bd16b0'],
        // IDs of any tests to execute
        // = tests: ['test-id-1', 'test-id-2', ...]
      },
    }, */
    ghostinspector: {
      options: {
        // The API key for your Ghost Inspector account
        apiKey: '3ebc4b1c2889f75554e99f49054ac2308ff65769',
      },
      qa: {
        // IDs of any suites to execute
        suites: ['56124a691b1c48181c61fe31',
        '561795eec0095bbf047d3378', '5669743dd538f1842b5a7f2d', ],
        // IDs of any tests to execute
        // = tests: ['test-id-1', 'test-id-2', ...]
      },
    },

    copy: {
      unchanged: {
        files: [{
            expand: true, cwd: src.viewsFolder,
            src: '**', dest: dest.viewsFolder,
          }, {
            expand: true, cwd: src.htmlFolder,
            src: '**', dest: dest.htmlFolder,
          }, {
            expand: true, cwd: src.jsLibFolder,
            src: '**', dest: dest.jsLibFolder,
          }, {
            expand: true, cwd: src.rfpviewsFolder,
            src: '**', dest: dest.rfpviewsFolder,
          },
        ],
      },
      dev: {
        files: [{
            expand: true, cwd: src.imgFolder, src: '**',
            dest: dest.imgFolder,
          }, {
            expand: true, cwd: src.lessLibFolder, src: '**',
            dest: dest.cssLibFolder,
          },
        ],
      },
      afterJSHint: {
        files: [{
            expand: true, cwd: src.adminRoutesFolder, src: '**',
            dest: dest.adminRoutesFolder,
          }, {
            expand: true, cwd: src.routesFolder, src: '**',
            dest: dest.routesFolder,
          }, {
            expand: true, cwd: src.modelsFolder, src: '**',
            dest: dest.modelsFolder,
          }, {
            expand: true, cwd: src.jsFolder, src: '*.js',
            dest: dest.jsFolder,
          },
        ],
      },
    },
  });
  var nodeEnv = grunt.option('NODE_ENV') || 'development';
  var cloudinaryTasks = [
    'jscs', 'jshint', /*'mochaTest:register',*/ 'clean',
    'copy:unchanged', 'copy:dev', 'copy:afterJSHint',
    'less:' + nodeEnv, 'uploadPublic:build',
  ];
  grunt.registerTask('default', devTasks);
  grunt.registerTask('development', devNoWatchTasks);
  grunt.registerTask('cloudinary-upload', cloudinaryTasks);
  grunt.registerTask('qa', qaTasks);
  grunt.registerTask('production', prodTasks);
};