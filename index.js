"use strict"

const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const file = require('file')

const createSourceList = (node)=>{
  var s = "";
  Object.keys(node).forEach( (each)=>{
    var value = node[each];
    if ( typeof value == 'object' ) {
      //skip
    } else {
      console.log( "file", each, value );
      s = s + '<li><a target="_self" href="/' + value + '">' + each + "</a></li>";
    }
  } )

  Object.keys(node).forEach( (each)=>{
    var value = node[each];
    if ( typeof value == 'object' ) {
      console.log( "dir", each, value );
      s = s + "<li>" + each + "/<ul>";
      s = s + createSourceList( value );
      s = s + "</ul>";
    }
  } )

  return s;
}

module.exports = {
  hooks: {
    'page': function (page) {
      const dir = path.dirname( page.path );
      const pomXml = path.join( dir, "pom.xml" );
      if ( ! fs.existsSync( pomXml ) ) {
        return page;
      }
      const srcDir = path.join( dir, "src" );
      if ( ! fs.existsSync( srcDir ) ) {
        return page;
      }

      const root = {};
      const all = {};
      all[dir] = root;

      console.log( "walk", dir );

      file.walkSync( dir, (curPath, dirList, fileList)=>{
        console.log( "walk", curPath, dirList, fileList );
        var node = all[curPath];
        if ( ! node ) {
          node = {};
          all[curPath] = node;
        } 
        dirList.forEach( (each)=>{
          node[each] = {};
          all[ path.join( curPath, each ) ] = node[each];
        } )
        fileList.filter( (e)=>{
          return ! e.endsWith( '.iml') && ! e.endsWith( '.adoc' );
        }).forEach( (each)=>{
          var fileLink = path.join( curPath, each );
          console.log( each, fileLink );
          node[each] = fileLink;
        });

        //files.push( item );
      } )

      const list = '<h2>Sources</h2><ul class="sourcelist">' + createSourceList( root ) + "</ul>";

      page.content = page.content + list;
      console.log( list );

      return page
    }
  }
}

