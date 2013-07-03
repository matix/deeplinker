var Base = deeplinker.Router.Base;

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

  it("executes a registered handler given a path", function () {
    var executed = false;
    router.addHandler("test/path", function () {
      executed = true;
    });

    router.navigate("test/path");

    expect(executed).toBe(true);
  });

  it("executes a registered handler given a path, and correctly passes arguments", function () {
    var executed = false;
    router.addHandler("test/:arg1/:arg2/test/:arg3", function (arg1, arg2, arg3) {
      expect(arg1).toBe("value1");
      expect(arg2).toBe("value2");
      expect(arg3).toBe("value3");
    });

    router.navigate("test/value1/value2/test/value3");
  });
});