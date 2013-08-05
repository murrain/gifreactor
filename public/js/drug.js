(function() {
  var Analytics, Drug, Search, Util,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Util = (function() {
    function Util() {}

    Util.mobile = /(iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec)/i.test(navigator.userAgent.toLowerCase());

    Util.tablet = /(ipad|android 3|sch-i800|playbook|tablet|kindle|gt-p1000|sgh-t849|shw-m180s|a510|a511|a100|dell streak|silk)/i.test(navigator.userAgent.toLowerCase());

    Util.desktop = !(Util.mobile || Util.tablet);

    Util.iOS = /(iphone|ipod|ipad)/i.test(navigator.userAgent.toLowerCase());

    Util.android = /(android)/i.test(navigator.userAgent.toLowerCase());

    Util._image = new Image();

    Util.preventRubberBand = function() {
      return $(document).on('touchmove', function(eventObject) {
        return eventObject.preventDefault();
      });
    };

    Util.portrait = function() {
      return this.mobile || this.tablet && innerHeight > innerWidth;
    };

    Util.landscape = function() {
      return this.mobile || this.tablet && innerHeight < innerWidth;
    };

    Util.preload = function(imageUrls) {
      var imageUrl, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = imageUrls.length; _i < _len; _i++) {
        imageUrl = imageUrls[_i];
        _results.push(this._image.src = "" + imageUrl);
      }
      return _results;
    };

    Util.to_seconds = function(hours_minutes_seconds) {
      var hours, minutes, seconds, _ref;
      _ref = hours_minutes_seconds.split(':'), hours = _ref[0], minutes = _ref[1], seconds = _ref[2];
      return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
    };

    return Util;

  })();

  Analytics = (function() {
    function Analytics() {}

    Analytics.init = function(webPropertyId) {
      var scriptTag;
      this._initQueue(webPropertyId);
      scriptTag = this._createScriptTag();
      this._injectScriptTag(scriptTag);
      return true;
    };

    Analytics._initQueue = function(webPropertyId) {
      if (window._gaq == null) {
        window._gaq = [];
      }
      window._gaq.push(['_setAccount', webPropertyId]);
      return window._gaq.push(['_trackPageview']);
    };

    Analytics._createScriptTag = function() {
      var protocol, scriptTag, subdomain;
      scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.async = true;
      protocol = location.protocol;
      subdomain = protocol === 'https:' ? 'ssl' : 'www';
      scriptTag.src = "" + protocol + "//" + subdomain + ".google-analytics.com/ga.js";
      return scriptTag;
    };

    Analytics._injectScriptTag = function(scriptTag) {
      var firstScriptTag;
      firstScriptTag = document.getElementsByTagName('script')[0];
      return firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
    };

    Analytics.trackPageView = function(url) {
      return window._gaq.push(['_trackPageview', url]);
    };

    Analytics.trackEvent = function(category, action, label, value, nonInteraction) {
      var argument, trackedEvent, _i, _len, _ref;
      if (label == null) {
        label = null;
      }
      if (value == null) {
        value = null;
      }
      if (nonInteraction == null) {
        nonInteraction = null;
      }
      trackedEvent = ['_trackEvent', category, action];
      _ref = [label, value, nonInteraction];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        argument = _ref[_i];
        if (argument != null) {
          trackedEvent.push(argument);
        } else {
          break;
        }
      }
      return window._gaq.push(trackedEvent);
    };

    return Analytics;

  })();

  Drug = (function() {
    function Drug() {}

    Drug._NEXT_KEYS = [32, 39];

    Drug._PREV_KEYS = [8, 37];

    Drug._VIDEO_KEYS = [13, 38];

    Drug._IMAGE_KEYS = [27, 40];

    Drug._SEARCH_KEYS = [191];

    Drug._loading = false;

    Drug._id = null;

    Drug._queue = [];

    Drug._index = 0;

    Drug._instructionsTimeoutId = null;

    Drug._instructing = false;

    Drug._mode = 'image';

    Drug._scrubbing = false;

    Drug.init = function() {
      var _this = this;
      if (!$('#image').length) {
        return false;
      }
      Util.preventRubberBand();
      $(window).on('hashchange', this._hashChange);
      $(document).on('keyup', this._keyUp);
      $('#image').on('click', this._click);
      $('#image').hammer().on('swipeleft', this._swipeLeft);
      $('#image').hammer().on('swiperight', this._swipeRight);
      $('#image').hammer().on('swipeup', this._swipeUp);
      $('#logo').on('click', this._click);
      $('#play-pause').on('click', this._playPause);
      $('#progress').noUiSlider({
        range: [0, 100],
        start: 0,
        handles: 1
      });
      $('#progress').on('change', this._seek);
      $('#progress a div').on('mousedown', this._grab);
      $('#progress a div').on('mouseup', this._release);
      $('#progress a div').hammer().on('dragstart', this._grab);
      $('#progress a div').hammer().on('dragend', this._release);
      this._next(true, false);
      this._instructionsTimeoutId = setTimeout(function() {
        var _ref;
        _ref = [true, null], _this._instructing = _ref[0], _this._instructionsTimeoutId = _ref[1];
        $('#instructions').fadeIn(200);
        return $('#image').fadeTo(200, 0.50, function() {
          return setTimeout(function() {
            $('#instructions').fadeOut(200);
            return $('#image').fadeTo(200, 1, function() {
              $('#instructions').remove();
              return _this._instructing = false;
            });
          }, 1000);
        });
      }, 3000);
      return true;
    };

    Drug._switchMode = function(mode) {
      var image;
      if (mode == null) {
        mode = null;
      }
      if (mode === null && Drug._mode === 'image') {
        mode = 'video';
      }
      if (mode === null && Drug._mode === 'video') {
        mode = 'image';
      }
      if (Drug._mode === mode) {
        return;
      }
      if (!$('#video').length) {
        return;
      }
      clearTimeout(Drug._instructionsTimeoutId);
      video[(Drug._mode = mode) === 'image' ? 'pause' : 'play']();
      $('#image')[Drug._mode === 'image' ? 'fadeIn' : 'fadeOut']();
      $('#video')[Drug._mode === 'image' ? 'fadeOut' : 'fadeIn']();
      if (!Util.mobile) {
        $('#progress')[Drug._mode === 'image' ? 'hide' : 'show']();
      }
      $('#play-pause').attr('src', "/images/" + (Drug._mode === 'image' ? 'play' : 'pause') + ".png");
      $('#play-pause').attr('title', Drug._mode === 'image' ? 'Play (up arrow)' : 'Pause (down arrow)');
      $('#play-pause').attr('alt', Drug._mode === 'image' ? 'Play (up arrow)' : 'Pause (down arrow)');
      image = Drug._queue[Drug._index - 1];
      return Analytics.trackEvent('Videos', (Drug._mode === 'image' ? 'Pause' : 'Play'), "#" + image.id + " - " + image.video.title);
    };

    Drug._hashChange = function() {
      var id;
      Drug._switchMode('image');
      id = parseInt(location.hash.slice(2), 10);
      if (Drug._id !== id) {
        Drug._next(true);
      }
      return false;
    };

    Drug._keyUp = function(eventObject) {
      var _ref, _ref1, _ref2, _ref3, _ref4;
      if (Drug._instructing) {
        return false;
      }
      if (Drug._mode === 'image') {
        if (_ref = eventObject.which, __indexOf.call(Drug._NEXT_KEYS, _ref) >= 0) {
          Drug._next(false);
        }
        if (_ref1 = eventObject.which, __indexOf.call(Drug._PREV_KEYS, _ref1) >= 0) {
          Drug._prev();
        }
        if (_ref2 = eventObject.which, __indexOf.call(Drug._VIDEO_KEYS, _ref2) >= 0) {
          Drug._switchMode();
        }
      }
      if (Drug._mode === 'video') {
        if (_ref3 = eventObject.which, __indexOf.call(Drug._IMAGE_KEYS, _ref3) >= 0) {
          Drug._switchMode();
        }
      }
      if (_ref4 = eventObject.which, __indexOf.call(Drug._SEARCH_KEYS, _ref4) >= 0) {
        window.location = '/search';
      }
      return false;
    };

    Drug._click = function() {
      if (Drug._instructing) {
        return false;
      }
      Drug._switchMode('image');
      Drug._next(false);
      return false;
    };

    Drug._playPause = function() {
      if (Drug._instructing) {
        return false;
      }
      Drug._switchMode();
      return false;
    };

    Drug._swipeLeft = function() {
      if (Drug._instructing) {
        return false;
      }
      Drug._switchMode('image');
      Drug._next(false);
      return false;
    };

    Drug._swipeRight = function() {
      if (Drug._instructing) {
        return false;
      }
      Drug._switchMode('image');
      Drug._prev();
      return false;
    };

    Drug._swipeUp = function() {
      if (Drug._instructing) {
        return false;
      }
      Drug._switchMode();
      return false;
    };

    Drug._loadedMetadata = function() {
      var image;
      image = Drug._queue[Drug._index - 1];
      video.currentTime = Util.to_seconds(image.video.start_time);
      return $('#progress').val(video.currentTime * 100 / video.duration);
    };

    Drug._timeUpdate = function() {
      if (!Drug._scrubbing) {
        return $('#progress').val(video.currentTime * 100 / video.duration);
      }
    };

    Drug._seek = function() {
      video.currentTime = $('#progress').val() / 100 * video.duration;
      return false;
    };

    Drug._grab = function() {
      return Drug._scrubbing = true;
    };

    Drug._release = function() {
      Drug._scrubbing = false;
      return true;
    };

    Drug._pause = function() {
      if (!video.webkitDisplayingFullscreen) {
        return Drug._ended();
      }
    };

    Drug._ended = function() {
      var image;
      Drug._switchMode('image');
      image = Drug._queue[Drug._index - 1];
      video.currentTime = Util.to_seconds(image.video.start_time);
      return $('#progress').val(video.currentTime * 100 / video.duration);
    };

    Drug._next = function(fullPageLoad, trackPageView) {
      var params, shown, url;
      if (trackPageView == null) {
        trackPageView = true;
      }
      if (!fullPageLoad && trackPageView) {
        clearTimeout(Drug._instructionsTimeoutId);
      }
      url = "/images/" + (Drug._category()) + "random.json";
      params = Drug._params(fullPageLoad);
      shown = fullPageLoad ? false : Drug._show();
      return $.ajax({
        url: url,
        dataType: 'json',
        data: params,
        cache: false,
        beforeSend: function() {
          if (Drug._loading) {
            return false;
          } else {
            Drug._loading = true;
          }
          if (params.count < 1) {
            return false;
          }
        }
      }).done(function(images) {
        var image;
        Drug._enqueue(fullPageLoad, images);
        if (!shown) {
          shown = Drug._show();
        }
        return Util.preload((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = images.length; _i < _len; _i++) {
            image = images[_i];
            _results.push(image.url);
          }
          return _results;
        })());
      }).always(function() {
        Drug._loading = false;
        if (trackPageView && shown) {
          return Analytics.trackPageView("/" + (Drug._category()) + "next");
        }
      });
    };

    Drug._prev = function() {
      if (this._show(false)) {
        return Analytics.trackPageView("/" + (this._category()) + "prev");
      }
    };

    Drug._category = function() {
      var category;
      category = location.pathname.slice(1);
      if (category) {
        return category + '/';
      } else {
        return '';
      }
    };

    Drug._params = function(fullPageLoad) {
      var id, index, params;
      params = {};
      params.count = Util.mobile || Util.tablet ? 3 : 6;
      if (fullPageLoad) {
        index = location.hash.charAt(1) === '!' ? 2 : 1;
        id = parseInt(location.hash.slice(index), 10);
        if (id) {
          params.id = id;
        }
      } else if (this._queue.length - this._index > params.count / 2) {
        params.count = 0;
      }
      return params;
    };

    Drug._show = function(next) {
      var image;
      if (next == null) {
        next = true;
      }
      if (next && this._index >= this._queue.length) {
        return false;
      }
      if (!next && this._index <= 1) {
        return false;
      }
      image = this._queue[next ? this._index++ : --this._index - 1];
      this._id = image.id;
      location.replace("#!" + image.id);
      if ($('#video').length) {
        video.pause();
        $('#video').remove();
      }
      if (image.video_html != null) {
        $('#image').before(image.video_html);
        $('#video').on('loadedmetadata', this._loadedMetadata);
        $('#video').on('timeupdate', this._timeUpdate);
        $('#video').on('pause', this._pause);
        $('#video').on('ended', this._ended);
      }
      $('#image').fadeOut(100, function() {
        $('#image').attr('src', image.url );
        $('#image').fadeIn(100);
        return $('#play-pause')[$('#video').length ? 'fadeIn' : 'fadeOut'](100);
      });
      return true;
    };

    Drug._enqueue = function(fullPageLoad, images) {
      var _ref, _ref1;
      if (fullPageLoad) {
        return _ref = [images, 0], this._queue = _ref[0], this._index = _ref[1], _ref;
      } else {
        return (_ref1 = this._queue).push.apply(_ref1, images);
      }
    };

    return Drug;

  }).call(this);

  Search = (function() {
    function Search() {}

    Search.init = function() {
      if (!$('#search').length) {
        return false;
      }
      if (Util.mobile || Util.tablet) {
        if ($("input[name='query']").attr('placeholder') === 'search') {
          $("input[name='query']").attr('placeholder', 'tap to search');
        }
      }
      return true;
    };

    return Search;

  })();

  $(function() {
    Analytics.init('UA-42894652-2');
    Drug.init();
    return Search.init();
  });

}).call(this);
