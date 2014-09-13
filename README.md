# svgatlas

## Overview

svgatlas is a simple tool for using SVG files with the pixi.js rendering engine. It lets you define an atlas file for SVGs, very similar to a traditional spritesheet. This ensures that all of your SVGs can be downloaded with a single network request instead of one request per file. The SVGs are then rasterized by rendering them to a hidden canvas element, and the resulting bitmaps are loaded into the pixi.js texture cache.

The atlas loader takes a scale parameter which lets you scale the SVGs prior to rasterizing them. This lets you render SVGs on the fly to the perfect size for the user's screen resolution and still have them be perfectly sharp, while allowing you to take advantage of the considerable performance improvements associated with manipulating bitmaps via canvas and WebGL.

![Results](image.png?raw=true =312x641)

## .svgatlas file format

The svgatlas file format is a simple JSON file. It's best illustrated with an example:

```javascript
{
  "file":"atlas.svg",
  "assets":[
    {
      "name":"tiger",
      "x":0,
      "y":0,
      "width":494.461,
      "height":509.729
    },
  ]
}
```

This specifies an atlas file named atlas.svg which contains one resource which will be named 'tiger' in the pixi.js texture cache. The bounding rectangle of the asset is specified. **Important Note**: The coordinate system in an svgatlas file treats (0,0) as the bottom-left corner of the SVG in order to make it easy to pull these numbers from Inkscape.

There's currently no automatic way to generate an svgatlas file from a given svg, although that would be a good tool to build in the future.

## Example usage

```javascript
  var loader = new svgatlas.SvgAtlasLoader(['atlas.svgatlas'], 0.5 /* scale factor */);
  loader.on('loaded', function() {
    var tiger = PIXI.Sprite.fromFrame('tiger');
    // Do something with tiger sprite
  });
  loader.load();
```

A full example is provided in the index.html file.