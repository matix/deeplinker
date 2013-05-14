var Base = _.ns("deeplinker.Router.Base");

describe("Router.Base", function(){

  var router, abHandler;

  it("can be instatiated", function(){
    router = new Base();

    expect(router).toBeDefined();
    expect(router instanceof Base).toBe(true);
  });

  it("can have handlers added", function() {

    router.addHandler("a/b/c", function () {
      console.log("Handler for a/b/c executed!");
    });

    router.addHandler("a/b", abHandler = function () {
      console.log("Handler for a/b executed!");
    });

    router.addHandler("a/b/:c", function () {
      console.log("Handler for a/b/:c executed!");
    });

    expect(router.handlers.length).toBe(3);
  });

  it("can have handlers removed", function() {

    router.removeHandler("a/b", abHandler);

    expect(router.handlers.length).toBe(2);
  });
});