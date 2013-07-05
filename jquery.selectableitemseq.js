/*! jQuery.selectableItemSequence (https://github.com/Takazudo/jQuery.imgUtil)
 * lastupdate: 2013-07-05
 * version: 0.0.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  var __hasProp = {}.hasOwnProperty,
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
    ns.Item = (function(_super) {

      __extends(Item, _super);

      Item.defaults = {
        class_inactive: null,
        class_active: null,
        index: null
      };

      function Item($el, options) {
        this.$el = $el;
        this.active = false;
        this.options = $.extend({}, ns.Item.defaults, options);
        this._eventify();
        this._handleInitialStats();
      }

      Item.prototype._eventify = function() {
        var _this = this;
        this.$el.bind('click', function(e) {
          e.preventDefault();
          return _this.trigger('click');
        });
        return this;
      };

      Item.prototype._handleInitialStats = function() {
        if (this.$el.hasClass(this.options.class_active)) {
          this.active = true;
        }
        return this;
      };

      Item.prototype.select = function() {
        if (this.active === true) {
          return this;
        }
        if (this.options.class_inactive) {
          this.$el.removeClass(this.options.class_inactive);
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
        if (this.options.class_inactive) {
          this.$el.addClass(this.options.class_inactive);
        }
        this.active = false;
        return this;
      };

      return Item;

    })(window.EveEve);
    ns.Sequence = (function(_super) {

      __extends(Sequence, _super);

      Sequence.defaults = {
        selector_item: null,
        class_activeItem: null,
        class_inactiveItem: null,
        eventPrefix: 'selectableitemsequence.',
        deselectOnActiveItemClick: false,
        multiSelect: false
      };

      function Sequence($el, options) {
        this.$el = $el;
        this.disabled = false;
        this.options = $.extend({}, ns.Sequence.defaults, options);
        if (this.options.multiSelect) {
          this.options.deselectOnActiveItemClick = true;
        }
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
            class_inactive: _this.options.class_inactiveItem,
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
            if (_this.disabled) {
              return;
            }
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
        if (!this.options.multiSelect) {
          this.deselectItemWithout(item);
        }
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

      Sequence.prototype.selectByIndex = function(index) {
        var item;
        item = this.findItemWhoseIndexIs(index);
        if (item === null) {
          return this;
        }
        this.select(item);
        return this;
      };

      Sequence.prototype.selectByIndexes = function(indexes) {
        var index, _i, _len;
        for (_i = 0, _len = indexes.length; _i < _len; _i++) {
          index = indexes[_i];
          this.selectByIndex(index);
        }
        return this;
      };

      Sequence.prototype.deselectAll = function() {
        var item, items, _i, _len;
        items = this.findActiveItems();
        if (items.length === 0) {
          return this;
        }
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          this.deselect(item);
        }
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

      Sequence.prototype.findItemWhoseIndexIs = function(index) {
        var item, _i, _len, _ref;
        _ref = this._items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.options.index === index) {
            return item;
          }
        }
        return null;
      };

      Sequence.prototype.findActiveItems = function() {
        var item, res, _i, _len, _ref;
        res = [];
        _ref = this._items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (item.active) {
            res.push(item);
          }
        }
        return res;
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
        var items, target;
        items = this.findActiveItems();
        if (items.length === 0) {
          return this;
        }
        target = this.findNextOf(items[0]);
        if (target === null) {
          return this;
        }
        this.select(target);
        return this;
      };

      Sequence.prototype.selectPrev = function() {
        var items, target;
        items = this.findActiveItems();
        if (items.length === 0) {
          return this;
        }
        target = this.findPrevOf(items[0]);
        if (target === null) {
          return this;
        }
        this.select(target);
        return this;
      };

      Sequence.prototype.selectUpTo = function(upTo) {
        var i, maxIndex, sholdIEnd,
          _this = this;
        if (upTo < 1) {
          return this;
        }
        maxIndex = this._items.length - 1;
        sholdIEnd = function() {
          var selectedCount;
          selectedCount = _this.countSelected();
          if (selectedCount >= upTo) {
            return true;
          }
          return false;
        };
        i = 0;
        while (i <= maxIndex) {
          if (sholdIEnd()) {
            return this;
          }
          this.selectByIndex(i);
          i += 1;
        }
        return this;
      };

      Sequence.prototype.countSelected = function() {
        return this.getSelectedElements().length;
      };

      Sequence.prototype.disable = function() {
        this.disabled = true;
        return this;
      };

      Sequence.prototype.enable = function() {
        this.disabled = false;
        return this;
      };

      Sequence.prototype.getSelectedElements = function() {
        var $selected, item, items, _i, _len;
        $selected = $();
        items = this.findActiveItems();
        if (items.length !== 0) {
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            $selected = $selected.add(item.$el);
          }
        }
        return $selected;
      };

      return Sequence;

    })(window.EveEve);
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
