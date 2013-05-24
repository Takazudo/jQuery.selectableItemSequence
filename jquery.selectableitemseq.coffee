# encapsulate plugin
do ($=jQuery, window=window, document=document) ->
  
  ns = {}

  # ============================================================
  # utils

  ns.cloneArray = (array) ->
    ret = []
    for item in array
      ret.push item
    return ret.reverse()

  # ============================================================
  # event module

  class ns.Event

    on: (ev, callback) ->
      @_callbacks = {} unless @_callbacks?
      evs = ev.split(' ')
      for name in evs
        @_callbacks[name] or= []
        @_callbacks[name].push(callback)
      return this

    once: (ev, callback) ->
      @on ev, ->
        @off(ev, arguments.callee)
        callback.apply(@, arguments)
      return this

    trigger: (args...) ->
      ev = args.shift()
      list = @_callbacks?[ev]
      return unless list
      for callback in list
        if callback.apply(@, args) is false
          break
      return this

    off: (ev, callback) ->
      unless ev
        @_callbacks = {}
        return this

      list = @_callbacks?[ev]
      return this unless list

      unless callback
        delete @_callbacks[ev]
        return this

      for cb, i in list when cb is callback
        list = list.slice()
        list.splice(i, 1)
        @_callbacks[ev] = list
        break

      return this

  # ============================================================
  # SequenceItem
  
  class ns.Item extends ns.Event

    @defaults =
      class_active: null
      index: null

    constructor: (@$el, options) ->

      @active = false
      @options = $.extend {}, ns.Item.defaults, options
      @_eventify()

    _eventify: ->

      @$el.bind 'click', (e) =>
        e.preventDefault()
        @trigger 'click'
      return this

    select: (silent = false) ->

      return this if @active is true
      @$el.addClass @options.class_active
      @active = true
      return this

    deselect: ->

      return this if @active is false
      @$el.removeClass @options.class_active
      @active = false
      return this

  # ============================================================
  # Sequence
  
  class ns.Sequence extends ns.Event

    @defaults =
      selector_item: null
      class_activeItem: null
      eventPrefix: 'selectableitemsequence.'
      deselectOnActiveItemClick: false

    constructor: (@$el, options) ->

      @options = $.extend {}, ns.Sequence.defaults, options
      @_createItemInstances()
      @_eventifyItems()

    # internal

    _createItemInstances: ->

      @_items = []
      (@$el.find @options.selector_item).each (i, itemEl) =>
        $item = $(itemEl)
        o =
          class_active: @options.class_activeItem
          index: i
        item = new ns.Item $item, o
        @_items.push item

      return this

    _eventifyItems: ->

      for item in @_items
        do (i = item) =>
          i.on 'click', =>
            if @options.deselectOnActiveItemClick and i.active
              @deselect i
            else
              @select i
          return

      return this

    # helpers

    triggerEvent: (evName, data = {}) ->
      @trigger evName, data
      @$el.trigger "#{@options.eventPrefix}#{evName}", data
      return this

    # state checkers

    isAnyItemActive: ->
      for item in @_items
        if item.active
          return true
      return false

    isFirstItem: (item) ->
      return @_items[0] is item

    isLastItem: (item) ->
      return @_items[@_items.length - 1] is item

    # select / deselect
    
    select: (item) ->

      return this if item.active
      
      @deselectItemWithout item
      item.select()
      data =
        el: item.$el
        index: item.options.index
        isFirstItem: @isFirstItem item
        isLastItem: @isLastItem item
      @triggerEvent 'select', data

      return this

    deselect: (item) ->
      
      return this unless item.active
      item.deselect()
      data =
        el: item.$el
        index: item.options.index
        isFirstItem: @isFirstItem item
        isLastItem: @isLastItem item
      @triggerEvent 'deselect', data
      if @isAnyItemActive() is false
        @triggerEvent 'allitemdeselected'
      return this

    deselectAll: ->

      item = @findActiveItem()
      return this if item is null
      @deselect item
      return this

    deselectItemWithout: (item) ->
      
      for i in @_items
        unless i is item
          @deselect i

      return this

    # find methods

    findActiveItem: ->
      
      for item in @_items
        if item.active
          return item
      return null

    findNextOf: (item) ->
      
      found = false
      for i in @_items
        if found
          return i
        if i is item
          found = true
      return null

    findPrevOf: (item) ->
      
      items = ns.cloneArray @_items
      found = false
      for i in items
        if found
          return i
        if i is item
          found = true
      return null

    # select methods

    selectNext: ->

      item = @findActiveItem()
      if item is null
        return this
      target = @findNextOf item
      if target is null
        return this
      @select target
      return this

    selectPrev: ->
      
      item = @findActiveItem()
      if item is null
        return this
      target = @findPrevOf item
      if target is null
        return this
      @select target
      return this

  # ============================================================
  # bridge

  $.fn.selectableItemSequence = (options) ->
    return @each (i, el) ->
      $el = $(el)
      $el.data 'selectableitemsequence', (new ns.Sequence $el, options)
  
  # ============================================================
  # globalify

  $.SelectableItemSequenceNs = ns
  $.SelectableItemSequence = ns.Sequence
