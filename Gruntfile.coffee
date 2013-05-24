module.exports = (grunt) ->
  
  grunt.task.loadTasks 'gruntcomponents/tasks'
  grunt.task.loadNpmTasks 'grunt-contrib-coffee'
  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'

  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')
    banner: """
/*! <%= pkg.name %> (<%= pkg.repository.url %>)
 * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
 * version: <%= pkg.version %>
 * author: <%= pkg.author %>
 * License: MIT */

"""

    growl:

      ok:
        title: 'COMPLETE!!'
        msg: '＼(^o^)／'

    coffee:

      selectableitemseq:
        src: [ 'jquery.selectableitemseq.coffee' ]
        dest: 'jquery.selectableitemseq.js'

    concat:

      banner:
        options:
          banner: '<%= banner %>'
        src: [ '<%= coffee.selectableitemseq.dest %>' ]
        dest: '<%= coffee.selectableitemseq.dest %>'
        
    uglify:

      options:
        banner: '<%= banner %>'
      selectableitemseq:
        src: '<%= concat.banner.dest %>'
        dest: 'jquery.selectableitemseq.min.js'

    watch:

      selectableitemseq:
        files: '<%= coffee.selectableitemseq.src %>'
        tasks: [
          'coffee:selectableitemseq'
          'concat'
          'uglify'
          'growl:ok'
        ]

  grunt.registerTask 'default', [
    'coffee'
    'concat'
    'uglify'
    'growl:ok'
  ]

