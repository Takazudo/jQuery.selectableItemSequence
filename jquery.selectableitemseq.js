/*! jQuery.selectableItemSequence (https://github.com/Takazudo/jQuery.imgUtil)
 * lastupdate: 2013-05-25
 * version: 0.0.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($, window, document) {
    var ns;
    ns = {};
    ns.cloneArray = function(array) {
      var item, ret, _i, _len;
      ret = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        item = array[_i];
        ret.push(item);
      }
      return ret.reverse();
    };
    ns.Event = (function() {

      function Event() {}

      Event.prototype.on = function(ev, callback) {
        var evs, name, _base, _i, _len;
        if (this._callbacks == null) {
          this._callbacks = {};
        }
        evs = ev.split(' ');
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
          name = evs[_i];
          (_base = this._callbacks)[name] || (_base[name] = []);
          this._callbacks[name].push(callback);
        }
        return this;
      };

      Event.prototype.once = function(ev, callback) {
        this.on(ev, function() {
          this.off(ev, arguments.callee);
          return callback.apply(this, arguments);
        });
        return this;
      };

      Event.prototype.trigger = function() {
        var args, callback, ev, list, _i, _len, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        ev = args.shift();
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return;
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          callback = list[_i];
          if (callback.apply(this, args) === false) {
            break;
          }
        }
        return this;
      };

      Event.prototype.off = function(ev, callback) {
        var cb, i, list, _i, _len, _ref;
        if (!ev) {
          this._callbacks = {};
          return this;
        }
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return this;
        }
        if (!callback) {
          delete this._callbacks[ev];
          return this;
        }
        for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
          cb = list[i];
          if (!(cb === callback)) {
            continue;
          }
          list = list.slice();
          list.splice(i, 1);
          this._callbacks[ev] = list;
          break;
        }
        return this;
      };

      return Event;

    })();
    ns.Item = (function(_super) {

      __extends(Item, _super);

      Item.defaults = {
        class_active: null,
        index: null
      };

      function Item($el, options) {
        this.$el = $el;
        this.active = false;
        this.options = $.extend({}, ns.Item.defaults, options);
        this._eventify();
      }

      Item.prototype._eventify = function() {
        var _this = this;
        this.$el.bind('click', function(e) {
          e.preventDefault();
          return _this.trigger('click');
        });
        return this;
      };

      Item.prototype.select = function(silent) {
        if (silent == null) {
          silent = false;
        }
        if (this.active === true) {
          return this;
        }
        this.$el.addClass(this.options.class_active);
        this.active = true;
        return this;
      };

      Item.prototype.deselect = function() {
        if (this.active === false) {
          return this;
        }
        this.$el.removeClass(this.options.class_active);
        this.active = false;
        return this;
      };

      return Item;

    })(ns.Event);
    ns.Sequence = (function(_super) {

      __extends(Sequence, _super);

      Sequence.defaults = {
        selector_item: null,
        class_activeItem: null,
        eventPrefix: 'selectableitemsequence.',
        deselectOnActiveItemClick: false
      };

      function Sequence($el, options) {
        this.$el = $el;
        this.options = $.extend({}, ns.Sequence.defaults, options);
        this._createItemInstances();
        this._eventifyItems();
      }

      Sequence.prototype._createItemInstances = function() {
        var _this = this;
        this._items = [];
        (this.$el.find(this.options.selector_item)).each(function(i, itemEl) {
          var $item, item, o;
          $item = $(itemEl);
          o = {
            class_active: _this.options.class_activeItem,
            index: i
          };
          item = new ns.Item($item, o);
          return _this._items.push(item);
        });
        return this;
      };

      Sequence.prototype._eventifyItems = function() {
        var item, _fn, _i, _len, _ref,
          _this = this;
        _ref = this._items;
        _fn = function(i) {
          i.on('click', function() {
            if (_this.options.deselectOnActiveItemClick && i.active) {
              return _this.deselect(i);
            } else {
              return _this.select(i);
            }
          });
        };
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _fn(item);
        }
        return this;
      };

      Sequence.prototype.triggerEvent = function(evName, data) {
        if (data == null) {
          data = {};
        }
        this.trigger(evName, data);
        this.$el.trigger("" + this.options.eventPrefix + evName, data);
        return this;
      };

      Sequence.prototype.isAnyItemActive = function() {
        var item, _i, _len, _ref;
        _ref = this._items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.active) {
            return true;
          }
        }
        return false;
      };

      Sequence.prototype.isFirstItem = function(item) {
        return this._items[0] === item;
      };

      Sequence.prototype.isLastItem = function(item) {
        return this._items[this._items.length - 1] === item;
      };

      Sequence.prototype.select = function(item) {
        var data;
        if (item.active) {
          return this;
        }
        this.deselectItemWithout(item);
        item.select();
        data = {
          el: item.$el,
          index: item.options.index,
          isFirstItem: this.isFirstItem(item),
          isLastItem: this.isLastItem(item)
        };
        this.triggerEvent('select', data);
        return this;
      };

      Sequence.prototype.deselect = function(item) {
        var data;
        if (!item.active) {
          return this;
        }
        item.deselect();
        data = {
          el: item.$el,
          index: item.options.index,
          isFirstItem: this.isFirstItem(item),
          isLastItem: this.isLastItem(item)
        };
        this.triggerEvent('deselect', data);
        if (this.isAnyItemActive() === false) {
          this.triggerEvent('allitemdeselected');
        }
        return this;
      };

      Sequence.prototype.deselectAll = function() {
        var item;
        item = this.findActiveItem();
        if (item === null) {
          return this;
        }
        this.deselect(item);
        return this;
      };

      Sequence.prototype.deselectItemWithout = function(item) {
        var i, _i, _len, _ref;
        _ref = this._items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          if (i !== item) {
            this.deselect(i);
          }
        }
        return this;
      };

      Sequence.prototype.findActiveItem = function() {
        var item, _i, _len, _ref;
        _ref = this._items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.active) {
            return item;
          }
        }
        return null;
      };

      Sequence.prototype.findNextOf = function(item) {
        var found, i, _i, _len, _ref;
        found = false;
        _ref = this._items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          if (found) {
            return i;
          }
          if (i === item) {
            found = true;
          }
        }
        return null;
      };

      Sequence.prototype.findPrevOf = function(item) {
        var found, i, items, _i, _len;
        items = ns.cloneArray(this._items);
        found = false;
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          i = items[_i];
          if (found) {
            return i;
          }
          if (i === item) {
            found = true;
          }
        }
        return null;
      };

      Sequence.prototype.selectNext = function() {
        var item, target;
        item = this.findActiveItem();
        if (item === null) {
          return this;
        }
        target = this.findNextOf(item);
        if (target === null) {
          return this;
        }
        this.select(target);
        return this;
      };

      Sequence.prototype.selectPrev = function() {
        var item, target;
        item = this.findActiveItem();
        if (item === null) {
          return this;
        }
        target = this.findPrevOf(item);
        if (target === null) {
          return this;
        }
        this.select(target);
        return this;
      };

      return Sequence;

    })(ns.Event);
    $.fn.selectableItemSequence = function(options) {
      return this.each(function(i, el) {
        var $el;
        $el = $(el);
        return $el.data('selectableitemsequence', new ns.Sequence($el, options));
      });
    };
    $.SelectableItemSequenceNs = ns;
    return $.SelectableItemSequence = ns.Sequence;
  })(jQuery, window, document);

}).call(this);
