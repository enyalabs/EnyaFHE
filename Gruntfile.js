module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        eslint: {
            options: {
                configFile: "./.eslintrc.json",
                fix: true,
            },
            target: [
                    "core/math/*.js", 
                    "core/src/*.js", 
                    "core/encryption/*.js", 
                    "core/requests/*.js", 
                    "index.js"
            ]
        }
    });
    grunt.loadNpmTasks("grunt-eslint");
    grunt.registerTask("default", ["eslint"]);
};