/*
 * from : http://fredrik.appelberg.me/2010/05/07/aop-js.html
 */


Aop = {
  // Apply around advice to all matching functions in the given namespaces
  around: function(pointcut, advice, namespaces) {
    // if no namespaces are supplied, use a trick to determine the global ns
    if (namespaces == undefined || namespaces.length == 0)
      namespaces = [(function() {
        return this;
      }).call()];
    // loop over all namespaces 
    for (var i in namespaces) {
      var ns = namespaces[i];
      for (var property in ns) {
        if (typeof ns[property] == 'function') { //} && property.match(pointcut)) {
          (function(fn, fnName, ns) {
            // replace the property fn slot with a wrapper which calls
            // the 'advice' Function
            ns[fnName] = function() {
              return advice.call(ns, {
                fn: fn,
                fnName: fnName,
                arguments: arguments
              });
            };
          })(ns[property], property, ns);
        }
      }
    }
  },

  // next: function(f) {
  next: function(f,self) {
    return f.fn.apply(self || this, f.arguments);
  }
};
