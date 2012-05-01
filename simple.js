(function(root, $, EventEmitter) {

    // The top-level namespace. All public Simple classes and modules will be
    // attached to this.
    var Simple = root.Simple = {};

    // Create a new view
    var View = Simple.View = function(options) {
        this.el = options.el;
        this.initialize(options);
    };

    // Create a new model
    var Model = Simple.Model = function(options) {
        this._events = new EventEmitter();
        this.attributes = {};
        this.initialize(options);
    };

    // Set up inheritance for the model and view.
    View.extend = Model.extend = function(properties) {
        var obj = $.extend.call({}, this.prototype, properties);
        return obj.constructor;
    };

    // Attach all inheritable methods to the View prototype.
    $.extend(View.prototype, {

        initialize: function() {},

        // `render` is the core function that a view should override in order to
        // populate it's element. Should always return `this`.
        render: function() {
            return this;
        },

        // jQuery delegate for element lookup, scoped to DOM elements within
        // the current view.
        DOM: function(selector) {
            return this.el.find(selector);
        }

    });

    $.extend(Model.prototype, {

        initialize: function() {},

        // Bind an event to a callback
        on: function(event, callback, context) {
            this._events.addListener(event, callback, context);
        },

        // Unbind an event
        off: function(event, callback) {
            this._events.removeListener(event, callback);
        },

        // Trigger an event
        trigger: function(event) {
            this._events.emit(event);
        },

        // Perform an ajax request
        fetch: function() {
            this.trigger('fetch:started');
            var model = this;

            $.ajax({
                url: model.url,
                dataType: "json",
                success: function(data) {
                    for (var prop in data) {
                        model.attr(prop, data[prop]);
                    }
                    model.trigger('fetch:finished');
                },
                error: function() {
                    model.trigger('fetch:error');
                }
            });
        },

        // Set or get an attribute
        attr: function(name, value) {
            if (typeof value === "undefined") {
                return this.attributes[name];
            } else {
                this.attributes[name] = value;
            }
        },

        // Returns all the attributes
        toJSON: function() {
            // Returns a copy of the attributes
            return $.extend({}, this.attributes);
        }
    });

})(this, jQuery, EventEmitter);