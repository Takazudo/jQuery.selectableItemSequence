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
  # SequenceItem
  
  class ns.Item extends window.EveEve

    @defaults =
      class_inactive: null
      class_active: null
      index: null

    constructor: (@$el, options) ->

      @active = false
      @options = $.extend {}, ns.Item.defaults, options
      @_eventify()
      @_handleInitialStats()

    _eventify: ->

      @$el.bind 'click', (e) =>
        e.preventDefault()
        @trigger 'click'
      return this

    _handleInitialStats: ->

      if @$el.hasClass @options.class_active
        @active = true
      return this

    select: ->

      return this if @active is true
      if @options.class_inactive
        @$el.removeClass @options.class_inactive
      @$el.addClass @options.class_active
      @active = true
      return this

    deselect: ->

      return this if @active is false
      @$el.removeClass @options.class_active
      if @options.class_inactive
        @$el.addClass @options.class_inactive
      @active = false
      return this

  # ============================================================
  # Sequence
  
  class ns.Sequence extends window.EveEve

    @defaults =
      selector_item: null
      class_activeItem: null
      class_inactiveItem: null
      eventPrefix: 'selectableitemsequence.'
      deselectOnActiveItemClick: false
      multiSelect: false

    constructor: (@$el, options) ->

      @options = $.extend {}, ns.Sequence.defaults, options
      if @options.multiSelect
        @options.deselectOnActiveItemClick = true

      @_createItemInstances()
      @_eventifyItems()

    # internal
    
    _createItemInstances: ->

      @_items = []
      (@$el.find @options.selector_item).each (i, itemEl) =>
        $item = $(itemEl)
        o =
          class_inactive: @options.class_inactiveItem
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
      
      unless @options.multiSelect
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

    selectByIndex: (index) ->

      item = @findItemWhoseIndexIs index
      return this if item is null
      @select item
      return this
      
    selectByIndexes: (indexes) ->

      for index in indexes
        @selectByIndex index
      return this
      
    deselectAll: ->

      items = @findActiveItems()
      return this if items.length is 0
      for item in items
        @deselect item
      return this

    deselectItemWithout: (item) ->
      
      for i in @_items
        unless i is item
          @deselect i

      return this

    # find methods

    findItemWhoseIndexIs: (index) ->

      for item in @_items
        if item.options.index is index
          return item
      return null

    findActiveItems: ->
      
      res = []
      for item in @_items
        if item.active
          res.push item
      return res

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

      items = @findActiveItems()
      if items.length is 0
        return this
      target = @findNextOf items[0]
      if target is null
        return this
      @select target
      return this

    selectPrev: ->
      
      items = @findActiveItems()
      if items.length is 0
        return this
      target = @findPrevOf items[0]
      if target is null
        return this
      @select target
      return this

    

    # misc
    
    getSelectedElements: ->
      # returns selected elements as jQuery object

      $selected = $()
      items = @findActiveItems()
      if items.length isnt 0
        for item in items
          $selected = $selected.add item.$el
      return $selected
      

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
