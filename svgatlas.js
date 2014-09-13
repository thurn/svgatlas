var svgatlas = {};

svgatlas.SvgAtlasLoader = function(url, scaleFactor, crossorigin) {
  PIXI.EventTarget.call(this);
  this.url = url;
  this.scaleFactor = scaleFactor;
  this.crossorigin = crossorigin;
};

// constructor
svgatlas.SvgAtlasLoader.prototype.constructor = svgatlas.SvgAtlasLoader;

svgatlas.SvgAtlasLoader.prototype.load = function() {
  var scope = this;

  if (window.XDomainRequest && scope.crossorigin) {
    this.ajaxRequest = new window.XDomainRequest();
    this.ajaxRequest.timeout = 3000;

    this.ajaxRequest.onerror = function () {
      scope.onError();
    };
    this.ajaxRequest.ontimeout = function () {
      scope.onError();
    };
    this.ajaxRequest.onprogress = function() {};
  } else if (window.XMLHttpRequest) {
    this.ajaxRequest = new window.XMLHttpRequest();
  } else {
    this.ajaxRequest = new window.ActiveXObject('Microsoft.XMLHTTP');
  }

  this.ajaxRequest.onload = function(){
    scope.onJSONLoaded();
  };

  this.ajaxRequest.open('GET',this.url,true);
  this.ajaxRequest.send();
};

svgatlas.SvgAtlasLoader.prototype.onJSONLoaded = function() {
  if(!this.ajaxRequest.responseText ) {
    this.onError();
    return;
  }

  var json = JSON.parse(this.ajaxRequest.responseText);
  var filename = json['file'];
  this.assets = json['assets'];
  var image = new Image();
  image.src = filename;
  image.onload = this.onImageLoaded.bind(this, image);
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