var svgatlas = {};

svgatlas.SvgAtlasLoader = function(url, scaleFactor, json, image) {
  PIXI.EventTarget.call(this);

  if (url == null) {
    this.url = null;
  } else {
    this.url = url;
  }

  if (scaleFactor == null) {
    this.scaleFactor = 1.0;
  } else {
    this.scaleFactor = scaleFactor;
  }

  if (json == null) {
    this.json = null;
  } else {
    this.json = json;
  }

  if (image == null) {
    this.image = null;
  } else {
    this.image = image;
  }
};

// constructor
svgatlas.SvgAtlasLoader.prototype.constructor = svgatlas.SvgAtlasLoader;

svgatlas.fromJsonUrl = function(url, scaleFactor) {
  return new svgatlas.SvgAtlasLoader(url, scaleFactor, null, null);
};

svgatlas.fromImageElement = function(image, scaleFactor, json) {
  return new svgatlas.SvgAtlasLoader(null, scaleFactor, null, null);
};

svgatlas.SvgAtlasLoader.prototype.load = function() {
  if (this.json != null) {
    this.readFromJSON();
    return;
  }

  var scope = this;

  this.ajaxRequest = new window.XMLHttpRequest();
  this.ajaxRequest.onload = function(){
    scope.onJSONLoaded();
  };

  this.ajaxRequest.open('GET', this.url, true);
  this.ajaxRequest.send();
};

svgatlas.SvgAtlasLoader.prototype.onJSONLoaded = function() {
  if(!this.ajaxRequest.responseText ) {
    this.onError();
    return;
  }
  this.json = JSON.parse(this.ajaxRequest.responseText);
  this.readFromJSON();
};


svgatlas.SvgAtlasLoader.prototype.readFromJSON = function() {
  this.assets = this.json['assets'];

  if (this.image == null) {
    this.image = new Image();
    this.image.src = this.json['file'];
  }

  if (this.image.complete) {
    this.onImageLoaded(this.image);
  } else {
    this.image.onload = this.onImageLoaded.bind(this, this.image);
  }
};

svgatlas.SvgAtlasLoader.prototype.onImageLoaded = function(image) {
  var canvas = document.createElement('canvas');
  canvas.height = image.height * this.scaleFactor;
  canvas.width = image.width * this.scaleFactor;
  var context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, image.width, image.height, 0, 0,
      image.width * this.scaleFactor, image.height * this.scaleFactor);

  var texture = PIXI.Texture.fromCanvas(canvas);
  for (var i = 0; i < this.assets.length; ++i) {
    var asset = this.assets[i];
    var name = asset['name'];
    var yCoordinate = image.height - asset['height'] - asset['y'];
    PIXI.TextureCache[name] = new PIXI.Texture(texture);
    PIXI.TextureCache[name].setFrame(new PIXI.Rectangle(asset['x'] * this.scaleFactor,
        yCoordinate * this.scaleFactor, asset['width'] * this.scaleFactor,
        asset['height'] * this.scaleFactor));
  };

  this.dispatchEvent({
    type: 'loaded',
    content: this
  });
};

svgatlas.SvgAtlasLoader.prototype.onError = function() {
  this.dispatchEvent({
    type: 'error',
    content: this
  });
};