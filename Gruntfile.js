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
        },
        uglify: {
            my_target: {
                files: [
                    {
                        expand: true,
                        src: [
                            "core/math/*.js",
                            "core/src/*.js",
                            "core/encryption/*.js",
                            "core/eval/*.js",
                            "core/requests/*.js",
                            "!core/math/*.min.js",
                            "!core/src/*.min.js",
                            "!core/requests/*.min.js",
                            "!core/encryption/*.min.js",
                            "!core/eval/*.min.js",
                        ],
                        dest: "dist",
                        cwd: ".",
                        rename: function(dst, src) {
                            return dst + "/" + src.replace("core/", "");
                        }
                    }
                ]
            }
        },
        watch: {
            files: ["core/math/*.js", "core/src/*.js", "core/encryption/*.js", "core/requests/*.js", "core/eval/*.js"],
            tasks: ["uglify"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify-es");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.registerTask("default", ["uglify", "eslint"]);
};