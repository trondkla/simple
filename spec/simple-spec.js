buster.spec.expose();

describe("Simple", function () {
    it("should be defined", function() {
        expect(Simple).toBeDefined();
    });

    it("exposes a view", function () {
        expect(Simple.View).toBeDefined();
    });

    it("exposes a model", function () {
        expect(Simple.Model).toBeDefined();
    });

    describe("Creation of new children", function() {
        it("enables creation of new children by using extend", function() {
            var Model = Simple.Model.extend({
                test: function() {
                    return "test";
                }
            });

            var model = new Model();

            expect(model.test).toBeDefined();
        });

        it("enables child creation from a created child", function() {
            var Model = Simple.Model.extend({
                test: function() {
                    return "child1";
                }
            });

            var NewModel = Model.extend({
                test2: function() {
                    return "child2";
                }
            });

            var model = new NewModel();

            expect(model.test()).toMatch("child1");
            expect(model.test2()).toMatch("child2");
        });

        it("can call properties on parent", function() {
            Simple.Model.prototype.test = function() {
                return "test";
            };

            var Model = Simple.Model.extend({});

            var model = new Model();

            expect(model.test()).toMatch("test");
        });

        it("favors properties in child over properties in parent", function() {
            Simple.Model.prototype.test = function() {
                return "parent";
            };

            var Model = Simple.Model.extend({
                test: function() {
                    return "child";
                }
            });

            var model = new Model();

            expect(model.test()).toMatch("child");

            delete Simple.Model.prototype.test;
        });

        it("reflects the parent's prototype changes after child is created", function() {
            var Model = Simple.Model.extend({});
            var model = new Model();

            Simple.Model.prototype.test = function() {
                return "parent";
            };

            expect(model.test()).toMatch("parent");
        });

        it("calls initialize with first parameter when model in initialized", function() {
            var spy = this.spy();

            var Model = Simple.Model.extend({
                initialize: spy
            });

            var opts = { test: "testing", test2: "testing" };
            new Model(opts);

            expect(spy).toHaveBeenCalledOnceWith(opts);
        });

    });

    describe("View", function() {
        beforeEach(function() {
            this.view = new Simple.View({ el: $('<div></div>') });
        });

        it("enables initialization of views using new", function() {
            expect(this.view instanceof Simple.View).toBeTrue();
        });

        it("enables creation of new views", function() {
            expect(Simple.View.extend).toBeDefined();
        });

        describe("render", function() {
            it("should return an instance of the view", function() {
                expect(this.view.render()).toBe(this.view);
            });
        });

        describe("DOM", function() {
            it("enables DOM selector search in the views rendered html", function() {
                this.view.el.html('<h1>Kim Joar</h1>');

                expect(this.view.DOM("h1").text()).toMatch("Kim Joar");
            });
        });
    });

    describe("Model", function() {
        beforeEach(function() {
            this.model = new Simple.Model();
        });

        it("enables initialization of models using new", function() {
            expect(this.model instanceof Simple.Model).toBeTrue();
        });

        it("enables creation of new models", function() {
            expect(Simple.Model.extend).toBeDefined();
        });

        describe("events", function() {
            it("allows binding and firing of events", function() {
                var spy = this.spy();

                this.model.on("test", spy, this.model);
                this.model.trigger("test");

                expect(spy).toHaveBeenCalledOnce();
                expect(spy).toHaveBeenCalledOn(this.model);
            });

            it("allows unbinding of events", function() {
                var spy = this.spy();

                this.model.on("test", spy);
                this.model.off("test", spy);
                this.model.trigger("test");

                expect(spy).not.toHaveBeenCalled();
            });

            it("creates a unique event handler for each instance", function() {
                var model2 = new Simple.Model();

                var spy = this.spy();
                var spy2 = this.spy();

                this.model.on("test", spy);
                model2.on("test", spy2);

                this.model.trigger("test");

                expect(spy).toHaveBeenCalledOnce();
                expect(spy2).not.toHaveBeenCalled();
            });
        });

        describe("fetch", function() {
            beforeEach(function() {
                var Model = Simple.Model.extend({
                    url: "/test"
                });
                this.model = new Model();

                this.fakeXhr = sinon.useFakeXMLHttpRequest();
                var requests = this.requests = [];

                this.fakeXhr.onCreate = function (xhr) {
                    requests.push(xhr);
                };
            });

            afterEach(function() {
                this.fakeXhr.restore();
            });

            it("performs an ajax request to the model's url", function() {
                this.model.fetch();

                expect(this.requests.length).toBe(1);
                expect(this.requests[0].url).toMatch(this.model.url);
            });

            it("triggers 'fetch:started' before request", function() {
                var spy = this.spy();
                this.model.on("fetch:started", spy);

                this.model.fetch();

                expect(spy).toHaveBeenCalledOnce();
            });

            it("triggers 'fetch:finished' on success", function() {
                var spy = this.spy();
                this.model.on("fetch:finished", spy);

                this.model.fetch();

                this.requests[0].respond();

                expect(spy).toHaveBeenCalledOnce();
            });

            it("sets attributes on success", function() {
                this.model.fetch();

                this.requests[0].respond(200, { "Content-Type": "application/json" },
                                 '{ "id": 12, "name": "Kim Joar" }');

                expect(this.model.attr("id")).toMatch(12);
                expect(this.model.attr("name")).toMatch("Kim Joar");
            });

            it("triggers 'fetch:error' on failure", function() {
                var spy = this.spy();
                this.model.on("fetch:error", spy);

                this.model.fetch();

                this.requests[0].respond(404);

                expect(spy).toHaveBeenCalledOnce();
            });
        });

        describe("attr", function() {
            it("can get and set a paramter", function() {
                var model = new Simple.Model();

                model.attr("name", "Kim Joar");

                expect(model.attr("name")).toMatch("Kim Joar");
            });
        });

        describe("toJSON", function() {
            it("returns all set attributes", function() {
                var model = new Simple.Model();

                model.attr("name", "Kim Joar");
                model.attr("employer", "BEKK");

                var data = model.toJSON();
                expect(data.name).toMatch("Kim Joar");
                expect(data.employer).toMatch("BEKK");
            });
        });
    });
});