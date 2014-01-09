(function () {
/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    function onResourceLoad(name, defined, deps){
        if(requirejs.onResourceLoad && name){
            requirejs.onResourceLoad({defined:defined}, {id:name}, deps);
        }
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }

        onResourceLoad(name, defined, args);
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../Scripts/almond-custom", function(){});

define('plugins/http',["jquery","knockout"],function(e,t){return{callbackParam:"callback",get:function(t,n){return e.ajax(t,{data:n})},jsonp:function(t,n,i){return-1==t.indexOf("=?")&&(i=i||this.callbackParam,t+=-1==t.indexOf("?")?"?":"&",t+=i+"=?"),e.ajax({url:t,dataType:"jsonp",data:n})},post:function(n,i){return e.ajax({url:n,data:t.toJSON(i),type:"POST",contentType:"application/json",dataType:"json"})},put:function(n,i){return e.ajax({url:n,data:t.toJSON(i),type:"PUT",contentType:"application/json",dataType:"json"})},"delete":function(t){return e.ajax({url:t,type:"DELETE",contentType:"application/json",dataType:"json"})}}});
define('data/leagueData',["plugins/http"],function(a){var e={};return{primeData:function(t,n){var i="/api/leaguedata/"+t;return n&&(i+="/preview"),a.get(i).then(function(a){e.teams=a.teams,e.games=a.games,e.locations=a.locations,e.league=a.league,e.standings=a.standings})},data:e}});
define('durandal/system',["require","jquery"],function(e,t){function n(e){var t="[object "+e+"]";i["is"+e]=function(e){return u.call(e)==t}}var i,r=!1,a=Object.keys,o=Object.prototype.hasOwnProperty,u=Object.prototype.toString,s=!1,c=Array.isArray,l=Array.prototype.slice;if(Function.prototype.bind&&("object"==typeof console||"function"==typeof console)&&"object"==typeof console.log)try{["log","info","warn","error","assert","dir","clear","profile","profileEnd"].forEach(function(e){console[e]=this.call(console[e],console)},Function.prototype.bind)}catch(d){s=!0}e.on&&e.on("moduleLoaded",function(e,t){i.setModuleId(e,t)}),"undefined"!=typeof requirejs&&(requirejs.onResourceLoad=function(e,t){i.setModuleId(e.defined[t.id],t.id)});var f=function(){},v=function(){try{if("undefined"!=typeof console&&"function"==typeof console.log)if(window.opera)for(var e=0;e<arguments.length;)console.log("Item "+(e+1)+": "+arguments[e]),e++;else 1==l.call(arguments).length&&"string"==typeof l.call(arguments)[0]?console.log(l.call(arguments).toString()):console.log.apply(console,l.call(arguments));else Function.prototype.bind&&!s||"undefined"==typeof console||"object"!=typeof console.log||Function.prototype.call.call(console.log,console,l.call(arguments))}catch(t){}},g=function(e){if(e instanceof Error)throw e;throw new Error(e)};i={version:"2.0.1",noop:f,getModuleId:function(e){return e?"function"==typeof e?e.prototype.__moduleId__:"string"==typeof e?null:e.__moduleId__:null},setModuleId:function(e,t){return e?"function"==typeof e?(e.prototype.__moduleId__=t,void 0):("string"!=typeof e&&(e.__moduleId__=t),void 0):void 0},resolveObject:function(e){return i.isFunction(e)?new e:e},debug:function(e){return 1==arguments.length&&(r=e,r?(this.log=v,this.error=g,this.log("Debug:Enabled")):(this.log("Debug:Disabled"),this.log=f,this.error=f)),r},log:f,error:f,assert:function(e,t){e||i.error(new Error(t||"Assert:Failed"))},defer:function(e){return t.Deferred(e)},guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=0|16*Math.random(),n="x"==e?t:8|3&t;return n.toString(16)})},acquire:function(){var t,n=arguments[0],r=!1;return i.isArray(n)?(t=n,r=!0):t=l.call(arguments,0),this.defer(function(n){e(t,function(){var e=arguments;setTimeout(function(){e.length>1||r?n.resolve(l.call(e,0)):n.resolve(e[0])},1)},function(e){n.reject(e)})}).promise()},extend:function(e){for(var t=l.call(arguments,1),n=0;n<t.length;n++){var i=t[n];if(i)for(var r in i)e[r]=i[r]}return e},wait:function(e){return i.defer(function(t){setTimeout(t.resolve,e)}).promise()}},i.keys=a||function(e){if(e!==Object(e))throw new TypeError("Invalid object");var t=[];for(var n in e)o.call(e,n)&&(t[t.length]=n);return t},i.isElement=function(e){return!(!e||1!==e.nodeType)},i.isArray=c||function(e){return"[object Array]"==u.call(e)},i.isObject=function(e){return e===Object(e)},i.isBoolean=function(e){return"boolean"==typeof e},i.isPromise=function(e){return e&&i.isFunction(e.then)};for(var p=["Arguments","Function","String","Number","Date","RegExp"],m=0;m<p.length;m++)n(p[m]);return i});
define('durandal/viewEngine',["durandal/system","jquery"],function(e,t){var n;return n=t.parseHTML?function(e){return t.parseHTML(e)}:function(e){return t(e).get()},{viewExtension:".html",viewPlugin:"text",isViewUrl:function(e){return-1!==e.indexOf(this.viewExtension,e.length-this.viewExtension.length)},convertViewUrlToViewId:function(e){return e.substring(0,e.length-this.viewExtension.length)},convertViewIdToRequirePath:function(e){return this.viewPlugin+"!"+e+this.viewExtension},parseMarkup:n,processMarkup:function(e){var t=this.parseMarkup(e);return this.ensureSingleElement(t)},ensureSingleElement:function(e){if(1==e.length)return e[0];for(var n=[],i=0;i<e.length;i++){var r=e[i];if(8!=r.nodeType){if(3==r.nodeType){var a=/\S/.test(r.nodeValue);if(!a)continue}n.push(r)}}return n.length>1?t(n).wrapAll('<div class="durandal-wrapper"></div>').parent().get(0):n[0]},createView:function(t){var n=this,i=this.convertViewIdToRequirePath(t);return e.defer(function(r){e.acquire(i).then(function(e){var i=n.processMarkup(e);i.setAttribute("data-view",t),r.resolve(i)}).fail(function(e){n.createFallbackView(t,i,e).then(function(e){e.setAttribute("data-view",t),r.resolve(e)})})}).promise()},createFallbackView:function(t,n){var i=this,r='View Not Found. Searched for "'+t+'" via path "'+n+'".';return e.defer(function(e){e.resolve(i.processMarkup('<div class="durandal-view-404">'+r+"</div>"))}).promise()}}});
define('durandal/viewLocator',["durandal/system","durandal/viewEngine"],function(e,t){function n(e,t){for(var n=0;n<e.length;n++){var i=e[n],r=i.getAttribute("data-view");if(r==t)return i}}function i(e){return(e+"").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,"\\$1")}return{useConvention:function(e,t,n){e=e||"viewmodels",t=t||"views",n=n||t;var r=new RegExp(i(e),"gi");this.convertModuleIdToViewId=function(e){return e.replace(r,t)},this.translateViewIdToArea=function(e,t){return t&&"partial"!=t?n+"/"+t+"/"+e:n+"/"+e}},locateViewForObject:function(t,n,i){var r;if(t.getView&&(r=t.getView()))return this.locateView(r,n,i);if(t.viewUrl)return this.locateView(t.viewUrl,n,i);var a=e.getModuleId(t);return a?this.locateView(this.convertModuleIdToViewId(a),n,i):this.locateView(this.determineFallbackViewId(t),n,i)},convertModuleIdToViewId:function(e){return e},determineFallbackViewId:function(e){var t=/function (.{1,})\(/,n=t.exec(e.constructor.toString()),i=n&&n.length>1?n[1]:"";return"views/"+i},translateViewIdToArea:function(e){return e},locateView:function(i,r,a){if("string"==typeof i){var o;if(o=t.isViewUrl(i)?t.convertViewUrlToViewId(i):i,r&&(o=this.translateViewIdToArea(o,r)),a){var u=n(a,o);if(u)return e.defer(function(e){e.resolve(u)}).promise()}return t.createView(o)}return e.defer(function(e){e.resolve(i)}).promise()}}});
define('durandal/binder',["durandal/system","knockout"],function(e,t){function n(t){return void 0===t?{applyBindings:!0}:e.isBoolean(t)?{applyBindings:t}:(void 0===t.applyBindings&&(t.applyBindings=!0),t)}function a(a,l,s,d){if(!l||!s)return i.throwOnErrors?e.error(r):e.log(r,l,d),void 0;if(!l.getAttribute)return i.throwOnErrors?e.error(o):e.log(o,l,d),void 0;var v=l.getAttribute("data-view");try{var f;return a&&a.binding&&(f=a.binding(l)),f=n(f),i.binding(d,l,f),f.applyBindings?(e.log("Binding",v,d),t.applyBindings(s,l)):a&&t.utils.domData.set(l,c,{$data:a}),i.bindingComplete(d,l,f),a&&a.bindingComplete&&a.bindingComplete(l),t.utils.domData.set(l,u,f),f}catch(m){m.message=m.message+";\nView: "+v+";\nModuleId: "+e.getModuleId(d),i.throwOnErrors?e.error(m):e.log(m.message)}}var i,r="Insufficient Information to Bind",o="Unexpected View Type",u="durandal-binding-instruction",c="__ko_bindingContext__";return i={binding:e.noop,bindingComplete:e.noop,throwOnErrors:!1,getBindingInstruction:function(e){return t.utils.domData.get(e,u)},bindContext:function(e,t,n){return n&&e&&(e=e.createChildContext(n)),a(n,t,e,n||(e?e.$data:null))},bind:function(e,t){return a(e,t,e,e)}}});
define('durandal/activator',["durandal/system","knockout"],function(e,t){function a(e){return void 0==e&&(e={}),e.closeOnDeactivate||(e.closeOnDeactivate=s.defaults.closeOnDeactivate),e.beforeActivate||(e.beforeActivate=s.defaults.beforeActivate),e.afterDeactivate||(e.afterDeactivate=s.defaults.afterDeactivate),e.affirmations||(e.affirmations=s.defaults.affirmations),e.interpretResponse||(e.interpretResponse=s.defaults.interpretResponse),e.areSameItem||(e.areSameItem=s.defaults.areSameItem),e}function n(t,a,n){return e.isArray(n)?t[a].apply(t,n):t[a](n)}function i(t,a,n,i,r){if(t&&t.deactivate){e.log("Deactivating",t);var o;try{o=t.deactivate(a)}catch(c){return e.error(c),i.resolve(!1),void 0}o&&o.then?o.then(function(){n.afterDeactivate(t,a,r),i.resolve(!0)},function(t){e.log(t),i.resolve(!1)}):(n.afterDeactivate(t,a,r),i.resolve(!0))}else t&&n.afterDeactivate(t,a,r),i.resolve(!0)}function r(t,a,i,r){if(t)if(t.activate){e.log("Activating",t);var o;try{o=n(t,"activate",r)}catch(c){return e.error(c),i(!1),void 0}o&&o.then?o.then(function(){a(t),i(!0)},function(t){e.log(t),i(!1)}):(a(t),i(!0))}else a(t),i(!0);else i(!0)}function o(t,a,n){return n.lifecycleData=null,e.defer(function(i){if(t&&t.canDeactivate){var r;try{r=t.canDeactivate(a)}catch(o){return e.error(o),i.resolve(!1),void 0}r.then?r.then(function(e){n.lifecycleData=e,i.resolve(n.interpretResponse(e))},function(t){e.error(t),i.resolve(!1)}):(n.lifecycleData=r,i.resolve(n.interpretResponse(r)))}else i.resolve(!0)}).promise()}function c(t,a,i,r){return i.lifecycleData=null,e.defer(function(o){if(t==a())return o.resolve(!0),void 0;if(t&&t.canActivate){var c;try{c=n(t,"canActivate",r)}catch(u){return e.error(u),o.resolve(!1),void 0}c.then?c.then(function(e){i.lifecycleData=e,o.resolve(i.interpretResponse(e))},function(t){e.error(t),o.resolve(!1)}):(i.lifecycleData=c,o.resolve(i.interpretResponse(c)))}else o.resolve(!0)}).promise()}function u(n,u){var s,l=t.observable(null);u=a(u);var v=t.computed({read:function(){return l()},write:function(e){v.viaSetter=!0,v.activateItem(e)}});return v.__activator__=!0,v.settings=u,u.activator=v,v.isActivating=t.observable(!1),v.canDeactivateItem=function(e,t){return o(e,t,u)},v.deactivateItem=function(t,a){return e.defer(function(e){v.canDeactivateItem(t,a).then(function(n){n?i(t,a,u,e,l):(v.notifySubscribers(),e.resolve(!1))})}).promise()},v.canActivateItem=function(e,t){return c(e,l,u,t)},v.activateItem=function(t,a){var n=v.viaSetter;return v.viaSetter=!1,e.defer(function(o){if(v.isActivating())return o.resolve(!1),void 0;v.isActivating(!0);var c=l();return u.areSameItem(c,t,s,a)?(v.isActivating(!1),o.resolve(!0),void 0):(v.canDeactivateItem(c,u.closeOnDeactivate).then(function(d){d?v.canActivateItem(t,a).then(function(d){d?e.defer(function(e){i(c,u.closeOnDeactivate,u,e)}).promise().then(function(){t=u.beforeActivate(t,a),r(t,l,function(e){s=a,v.isActivating(!1),o.resolve(e)},a)}):(n&&v.notifySubscribers(),v.isActivating(!1),o.resolve(!1))}):(n&&v.notifySubscribers(),v.isActivating(!1),o.resolve(!1))}),void 0)}).promise()},v.canActivate=function(){var e;return n?(e=n,n=!1):e=v(),v.canActivateItem(e)},v.activate=function(){var e;return n?(e=n,n=!1):e=v(),v.activateItem(e)},v.canDeactivate=function(e){return v.canDeactivateItem(v(),e)},v.deactivate=function(e){return v.deactivateItem(v(),e)},v.includeIn=function(e){e.canActivate=function(){return v.canActivate()},e.activate=function(){return v.activate()},e.canDeactivate=function(e){return v.canDeactivate(e)},e.deactivate=function(e){return v.deactivate(e)}},u.includeIn?v.includeIn(u.includeIn):n&&v.activate(),v.forItems=function(t){u.closeOnDeactivate=!1,u.determineNextItemToActivate=function(e,t){var a=t-1;return-1==a&&e.length>1?e[1]:a>-1&&a<e.length-1?e[a]:null},u.beforeActivate=function(e){var a=v();if(e){var n=t.indexOf(e);-1==n?t.push(e):e=t()[n]}else e=u.determineNextItemToActivate(t,a?t.indexOf(a):0);return e},u.afterDeactivate=function(e,a){a&&t.remove(e)};var a=v.canDeactivate;v.canDeactivate=function(n){return n?e.defer(function(e){function a(){for(var t=0;t<r.length;t++)if(!r[t])return e.resolve(!1),void 0;e.resolve(!0)}for(var i=t(),r=[],o=0;o<i.length;o++)v.canDeactivateItem(i[o],n).then(function(e){r.push(e),r.length==i.length&&a()})}).promise():a()};var n=v.deactivate;return v.deactivate=function(a){return a?e.defer(function(e){function n(n){v.deactivateItem(n,a).then(function(){r++,t.remove(n),r==o&&e.resolve()})}for(var i=t(),r=0,o=i.length,c=0;o>c;c++)n(i[c])}).promise():n()},v},v}var s,l={closeOnDeactivate:!0,affirmations:["yes","ok","true"],interpretResponse:function(a){return e.isObject(a)&&(a=a.can||!1),e.isString(a)?-1!==t.utils.arrayIndexOf(this.affirmations,a.toLowerCase()):a},areSameItem:function(e,t){return e==t},beforeActivate:function(e){return e},afterDeactivate:function(e,t,a){t&&a&&a(null)}};return s={defaults:l,create:u,isActivator:function(e){return e&&e.__activator__}}});
define('durandal/composition',["durandal/system","durandal/viewLocator","durandal/binder","durandal/viewEngine","durandal/activator","jquery","knockout"],function(e,t,n,i,a,r,o){function c(e){for(var t=[],n={childElements:t,activeView:null},i=o.virtualElements.firstChild(e);i;)1==i.nodeType&&(t.push(i),i.getAttribute(D)&&(n.activeView=i)),i=o.virtualElements.nextSibling(i);return n.activeView||(n.activeView=t[0]),n}function l(){S--,0===S&&setTimeout(function(){for(var t=A.length;t--;)try{A[t]()}catch(n){e.error(n)}A=[]},1)}function u(e){delete e.activeView,delete e.viewElements}function s(t,n,i){if(i)n();else if(t.activate&&t.model&&t.model.activate){var a;try{a=e.isArray(t.activationData)?t.model.activate.apply(t.model,t.activationData):t.model.activate(t.activationData),a&&a.then?a.then(n,function(t){e.error(t),n()}):a||void 0===a?n():(l(),u(t))}catch(r){e.error(r)}}else n()}function d(){var t=this;if(t.activeView&&t.activeView.removeAttribute(D),t.child)try{t.model&&t.model.attached&&(t.composingNewView||t.alwaysTriggerAttach)&&t.model.attached(t.child,t.parent,t),t.attached&&t.attached(t.child,t.parent,t),t.child.setAttribute(D,!0),t.composingNewView&&t.model&&t.model.detached&&o.utils.domNodeDisposal.addDisposeCallback(t.child,function(){try{t.model.detached(t.child,t.parent,t)}catch(n){e.error(n)}})}catch(n){e.error(n)}t.triggerAttach=e.noop}function v(t){if(e.isString(t.transition)){if(t.activeView){if(t.activeView==t.child)return!1;if(!t.child)return!0;if(t.skipTransitionOnSameViewId){var n=t.activeView.getAttribute("data-view"),i=t.child.getAttribute("data-view");return n!=i}}return!0}return!1}function f(e){for(var t=0,n=e.length,i=[];n>t;t++){var a=e[t].cloneNode(!0);i.push(a)}return i}function m(e){var t=f(e.parts),n=b.getParts(t,null,!0),i=b.getParts(e.child);for(var a in n)r(i[a]).replaceWith(n[a])}function g(t){var n,i,a=o.virtualElements.childNodes(t.parent);if(!e.isArray(a)){var r=[];for(n=0,i=a.length;i>n;n++)r[n]=a[n];a=r}for(n=1,i=a.length;i>n;n++)o.removeNode(a[n])}function p(e){o.utils.domData.set(e,N,e.style.display),e.style.display="none"}function h(e){e.style.display=o.utils.domData.get(e,N)}function w(e){var t=e.getAttribute("data-bind");if(!t)return!1;for(var n=0,i=O.length;i>n;n++)if(t.indexOf(O[n])>-1)return!0;return!1}var b,y={},D="data-active-view",A=[],S=0,k="durandal-composition-data",I="data-part",V=["model","view","transition","area","strategy","activationData"],N="durandal-visibility-data",O=["compose:"],x={complete:function(e){A.push(e)}};return b={composeBindings:O,convertTransitionToModuleId:function(e){return"transitions/"+e},defaultTransitionName:null,current:x,addBindingHandler:function(e,t,n){var i,a,r="composition-handler-"+e;t=t||o.bindingHandlers[e],n=n||function(){return void 0},a=o.bindingHandlers[e]={init:function(e,i,a,c,l){if(S>0){var u={trigger:o.observable(null)};b.current.complete(function(){t.init&&t.init(e,i,a,c,l),t.update&&(o.utils.domData.set(e,r,t),u.trigger("trigger"))}),o.utils.domData.set(e,r,u)}else o.utils.domData.set(e,r,t),t.init&&t.init(e,i,a,c,l);return n(e,i,a,c,l)},update:function(e,t,n,i,a){var c=o.utils.domData.get(e,r);return c.update?c.update(e,t,n,i,a):(c.trigger&&c.trigger(),void 0)}};for(i in t)"init"!==i&&"update"!==i&&(a[i]=t[i])},getParts:function(e,t,n){if(t=t||{},!e)return t;void 0===e.length&&(e=[e]);for(var i=0,a=e.length;a>i;i++){var r=e[i];if(r.getAttribute){if(!n&&w(r))continue;var o=r.getAttribute(I);o&&(t[o]=r),!n&&r.hasChildNodes()&&b.getParts(r.childNodes,t)}}return t},cloneNodes:f,finalize:function(t){if(void 0===t.transition&&(t.transition=this.defaultTransitionName),t.child||t.activeView)if(v(t)){var i=this.convertTransitionToModuleId(t.transition);e.acquire(i).then(function(e){t.transition=e,e(t).then(function(){if(t.cacheViews){if(t.activeView){var e=n.getBindingInstruction(t.activeView);e&&void 0!=e.cacheViews&&!e.cacheViews&&o.removeNode(t.activeView)}}else t.child?g(t):o.virtualElements.emptyNode(t.parent);t.triggerAttach(),l(),u(t)})}).fail(function(t){e.error("Failed to load transition ("+i+"). Details: "+t.message)})}else{if(t.child!=t.activeView){if(t.cacheViews&&t.activeView){var a=n.getBindingInstruction(t.activeView);!a||void 0!=a.cacheViews&&!a.cacheViews?o.removeNode(t.activeView):p(t.activeView)}t.child?(t.cacheViews||g(t),h(t.child)):t.cacheViews||o.virtualElements.emptyNode(t.parent)}t.triggerAttach(),l(),u(t)}else t.cacheViews||o.virtualElements.emptyNode(t.parent),t.triggerAttach(),l(),u(t)},bindAndShow:function(e,t,a){t.child=e,t.composingNewView=t.cacheViews?-1==o.utils.arrayIndexOf(t.viewElements,e):!0,s(t,function(){if(t.binding&&t.binding(t.child,t.parent,t),t.preserveContext&&t.bindingContext)t.composingNewView&&(t.parts&&m(t),p(e),o.virtualElements.prepend(t.parent,e),n.bindContext(t.bindingContext,e,t.model));else if(e){var a=t.model||y,r=o.dataFor(e);if(r!=a){if(!t.composingNewView)return o.removeNode(e),i.createView(e.getAttribute("data-view")).then(function(e){b.bindAndShow(e,t,!0)}),void 0;t.parts&&m(t),p(e),o.virtualElements.prepend(t.parent,e),n.bind(a,e)}}b.finalize(t)},a)},defaultStrategy:function(e){return t.locateViewForObject(e.model,e.area,e.viewElements)},getSettings:function(t){var n,r=t(),c=o.utils.unwrapObservable(r)||{},l=a.isActivator(r);if(e.isString(c))return c=i.isViewUrl(c)?{view:c}:{model:c,activate:!0};if(n=e.getModuleId(c))return c={model:c,activate:!0};!l&&c.model&&(l=a.isActivator(c.model));for(var u in c)c[u]=-1!=o.utils.arrayIndexOf(V,u)?o.utils.unwrapObservable(c[u]):c[u];return l?c.activate=!1:void 0===c.activate&&(c.activate=!0),c},executeStrategy:function(e){e.strategy(e).then(function(t){b.bindAndShow(t,e)})},inject:function(n){return n.model?n.view?(t.locateView(n.view,n.area,n.viewElements).then(function(e){b.bindAndShow(e,n)}),void 0):(n.strategy||(n.strategy=this.defaultStrategy),e.isString(n.strategy)?e.acquire(n.strategy).then(function(e){n.strategy=e,b.executeStrategy(n)}).fail(function(t){e.error("Failed to load view strategy ("+n.strategy+"). Details: "+t.message)}):this.executeStrategy(n),void 0):(this.bindAndShow(null,n),void 0)},compose:function(n,i,a,r){S++,r||(i=b.getSettings(function(){return i},n)),i.compositionComplete&&A.push(function(){i.compositionComplete(i.child,i.parent,i)}),A.push(function(){i.composingNewView&&i.model&&i.model.compositionComplete&&i.model.compositionComplete(i.child,i.parent,i)});var o=c(n);i.activeView=o.activeView,i.parent=n,i.triggerAttach=d,i.bindingContext=a,i.cacheViews&&!i.viewElements&&(i.viewElements=o.childElements),i.model?e.isString(i.model)?e.acquire(i.model).then(function(t){i.model=e.resolveObject(t),b.inject(i)}).fail(function(t){e.error("Failed to load composed module ("+i.model+"). Details: "+t.message)}):b.inject(i):i.view?(i.area=i.area||"partial",i.preserveContext=!0,t.locateView(i.view,i.area,i.viewElements).then(function(e){b.bindAndShow(e,i)})):this.bindAndShow(null,i)}},o.bindingHandlers.compose={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,a,r){var c=b.getSettings(t,e);if(c.mode){var l=o.utils.domData.get(e,k);if(!l){var u=o.virtualElements.childNodes(e);l={},"inline"===c.mode?l.view=i.ensureSingleElement(u):"templated"===c.mode&&(l.parts=f(u)),o.virtualElements.emptyNode(e),o.utils.domData.set(e,k,l)}"inline"===c.mode?c.view=l.view.cloneNode(!0):"templated"===c.mode&&(c.parts=l.parts),c.preserveContext=!0}b.compose(e,c,r,!0)}},o.virtualElements.allowedBindings.compose=!0,b});
define('durandal/events',["durandal/system"],function(e){var t=/\s+/,n=function(){},i=function(e,t){this.owner=e,this.events=t};return i.prototype.then=function(e,t){return this.callback=e||this.callback,this.context=t||this.context,this.callback?(this.owner.on(this.events,this.callback,this.context),this):this},i.prototype.on=i.prototype.then,i.prototype.off=function(){return this.owner.off(this.events,this.callback,this.context),this},n.prototype.on=function(e,n,a){var r,o,c;if(n){for(r=this.callbacks||(this.callbacks={}),e=e.split(t);o=e.shift();)c=r[o]||(r[o]=[]),c.push(n,a);return this}return new i(this,e)},n.prototype.off=function(n,i,a){var r,o,c,l;if(!(o=this.callbacks))return this;if(!(n||i||a))return delete this.callbacks,this;for(n=n?n.split(t):e.keys(o);r=n.shift();)if((c=o[r])&&(i||a))for(l=c.length-2;l>=0;l-=2)i&&c[l]!==i||a&&c[l+1]!==a||c.splice(l,2);else delete o[r];return this},n.prototype.trigger=function(e){var n,i,a,r,o,c,l,s;if(!(i=this.callbacks))return this;for(s=[],e=e.split(t),r=1,o=arguments.length;o>r;r++)s[r-1]=arguments[r];for(;n=e.shift();){if((l=i.all)&&(l=l.slice()),(a=i[n])&&(a=a.slice()),a)for(r=0,o=a.length;o>r;r+=2)a[r].apply(a[r+1]||this,s);if(l)for(c=[n].concat(s),r=0,o=l.length;o>r;r+=2)l[r].apply(l[r+1]||this,c)}return this},n.prototype.proxy=function(e){var t=this;return function(n){t.trigger(e,n)}},n.includeIn=function(e){e.on=n.prototype.on,e.off=n.prototype.off,e.trigger=n.prototype.trigger,e.proxy=n.prototype.proxy},n});
define('durandal/app',["durandal/system","durandal/viewEngine","durandal/composition","durandal/events","jquery"],function(e,t,a,n,i){function r(){return e.defer(function(t){return 0==c.length?(t.resolve(),void 0):(e.acquire(c).then(function(a){for(var n=0;n<a.length;n++){var i=a[n];if(i.install){var r=u[n];e.isObject(r)||(r={}),i.install(r),e.log("Plugin:Installed "+c[n])}else e.log("Plugin:Loaded "+c[n])}t.resolve()}).fail(function(t){e.error("Failed to load plugin(s). Details: "+t.message)}),void 0)}).promise()}var o,c=[],u=[];return o={title:"Application",configurePlugins:function(t,a){var n=e.keys(t);a=a||"plugins/",-1===a.indexOf("/",a.length-1)&&(a+="/");for(var i=0;i<n.length;i++){var r=n[i];c.push(a+r),u.push(t[r])}},start:function(){return e.log("Application:Starting"),this.title&&(document.title=this.title),e.defer(function(t){i(function(){r().then(function(){t.resolve(),e.log("Application:Started")})})}).promise()},setRoot:function(n,i,r){var o,c={activate:!0,transition:i};o=!r||e.isString(r)?document.getElementById(r||"applicationHost"):r,e.isString(n)?t.isViewUrl(n)?c.view=n:c.model=n:c.model=n,a.compose(o,c)}},n.includeIn(o),o});
requirejs.config({paths:{text:"../Scripts/text",durandal:"../Scripts/durandal",plugins:"../Scripts/durandal/plugins",transitions:"../Scripts/durandal/transitions",lodash:"../Scripts/lodash"},shim:{lodash:{exports:"_"}}}),define("jquery",[],function(){return jQuery}),define("knockout",ko),define('main',["durandal/system","durandal/app","durandal/viewLocator"],function(e,t,n){e.debug(!0),t.title="HC Middle School JV",t.configurePlugins({router:!0,dialog:!0,widget:!0,observable:!0}),t.start().then(function(){n.useConvention(),t.setRoot("viewmodels/shell","entrance")})});
define('viewmodels/fullschedule',["durandal/app","data/leagueData"],function(a,e){var t=this;return t.games=ko.observableArray(),t.leagueName=ko.observable(),t.activate=function(){t.games(e.data.games),t.leagueName(e.data.league.name)},{activate:t.activate,games:t.games}});
define('viewmodels/home',["data/leagueData"],function(e){return{leagueName:e.data.league.name,homeContent:e.data.league.homeScreen}});
define('viewmodels/locations',["data/leagueData"],function(a){var e=this;return e.locations=ko.observableArray(),e.leagueName=ko.observable(),e.activate=function(){e.locations(a.data.locations),e.leagueName(a.data.league.name)},{activate:e.activate,locations:e.locations}});
define('viewmodels/locationschedule',["durandal/app","data/leagueData"],function(a,e){function t(a){n.title("Location Schedule for "+a);var t=_.filter(e.data.games,function(e){return e.location==a});return n.games(t),!0}var n={activate:t,title:ko.observable(),games:ko.observableArray(),scoreboardAlert:function(){var e=this.team1TakesScoreboard?this.team1:this.team2;a.showMessage(e+" takes scoreboard and scorebook home.","Scoreboard")}};return n});
define('viewmodels/rules',["data/leagueData"],function(a){return{leagueName:a.data.league.name,rulesContent:a.data.league.rulesScreen}});
define('plugins/history',["durandal/system","jquery"],function(e,t){function n(e,t,n){if(n){var i=e.href.replace(/(javascript:|#).*$/,"");e.replace(i+"#"+t)}else e.hash="#"+t}var i=/^[#\/]|\s+$/g,a=/^\/+|\/+$/g,o=/msie [\w.]+/,r=/\/$/,s={interval:50,active:!1};return"undefined"!=typeof window&&(s.location=window.location,s.history=window.history),s.getHash=function(e){var t=(e||s).location.href.match(/#(.*)$/);return t?t[1]:""},s.getFragment=function(e,t){if(null==e)if(s._hasPushState||!s._wantsHashChange||t){e=s.location.pathname+s.location.search;var n=s.root.replace(r,"");e.indexOf(n)||(e=e.substr(n.length))}else e=s.getHash();return e.replace(i,"")},s.activate=function(n){s.active&&e.error("History has already been activated."),s.active=!0,s.options=e.extend({},{root:"/"},s.options,n),s.root=s.options.root,s._wantsHashChange=s.options.hashChange!==!1,s._wantsPushState=!!s.options.pushState,s._hasPushState=!!(s.options.pushState&&s.history&&s.history.pushState);var r=s.getFragment(),c=document.documentMode,l=o.exec(navigator.userAgent.toLowerCase())&&(!c||7>=c);s.root=("/"+s.root+"/").replace(a,"/"),l&&s._wantsHashChange&&(s.iframe=t('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow,s.navigate(r,!1)),s._hasPushState?t(window).on("popstate",s.checkUrl):s._wantsHashChange&&"onhashchange"in window&&!l?t(window).on("hashchange",s.checkUrl):s._wantsHashChange&&(s._checkUrlInterval=setInterval(s.checkUrl,s.interval)),s.fragment=r;var u=s.location,d=u.pathname.replace(/[^\/]$/,"$&/")===s.root;if(s._wantsHashChange&&s._wantsPushState){if(!s._hasPushState&&!d)return s.fragment=s.getFragment(null,!0),s.location.replace(s.root+s.location.search+"#"+s.fragment),!0;s._hasPushState&&d&&u.hash&&(this.fragment=s.getHash().replace(i,""),this.history.replaceState({},document.title,s.root+s.fragment+u.search))}return s.options.silent?void 0:s.loadUrl()},s.deactivate=function(){t(window).off("popstate",s.checkUrl).off("hashchange",s.checkUrl),clearInterval(s._checkUrlInterval),s.active=!1},s.checkUrl=function(){var e=s.getFragment();return e===s.fragment&&s.iframe&&(e=s.getFragment(s.getHash(s.iframe))),e===s.fragment?!1:(s.iframe&&s.navigate(e,!1),s.loadUrl(),void 0)},s.loadUrl=function(e){var t=s.fragment=s.getFragment(e);return s.options.routeHandler?s.options.routeHandler(t):!1},s.navigate=function(t,i){if(!s.active)return!1;if(void 0===i?i={trigger:!0}:e.isBoolean(i)&&(i={trigger:i}),t=s.getFragment(t||""),s.fragment!==t){s.fragment=t;var a=s.root+t;if(""===t&&"/"!==a&&(a=a.slice(0,-1)),s._hasPushState)s.history[i.replace?"replaceState":"pushState"]({},document.title,a);else{if(!s._wantsHashChange)return s.location.assign(a);n(s.location,t,i.replace),s.iframe&&t!==s.getFragment(s.getHash(s.iframe))&&(i.replace||s.iframe.document.open().close(),n(s.iframe.location,t,i.replace))}return i.trigger?s.loadUrl(t):void 0}},s.navigateBack=function(){s.history.back()},s});
define('plugins/router',["durandal/system","durandal/app","durandal/activator","durandal/events","durandal/composition","plugins/history","knockout","jquery"],function(e,t,n,i,a,r,o,s){function c(e){return e=e.replace(h,"\\$&").replace(g,"(?:$1)?").replace(p,function(e,t){return t?e:"([^/]+)"}).replace(m,"(.*?)"),new RegExp("^"+e+"$")}function u(e){var t=e.indexOf(":"),n=t>0?t-1:e.length;return e.substring(0,n)}function l(e,t){return-1!==e.indexOf(t,e.length-t.length)}function d(e,t){if(!e||!t)return!1;if(e.length!=t.length)return!1;for(var n=0,i=e.length;i>n;n++)if(e[n]!=t[n])return!1;return!0}var f,v,g=/\((.*?)\)/g,p=/(\(\?)?:\w+/g,m=/\*\w+/g,h=/[\-{}\[\]+?.,\\\^$|#\s]/g,b=/\/$/,y=function(){function a(e){return e.router&&e.router.parent==M}function s(e){O&&O.config.isActive&&O.config.isActive(e)}function g(t,n){e.log("Navigation Complete",t,n);var i=e.getModuleId(N);i&&M.trigger("router:navigation:from:"+i),N=t,s(!1),O=n,s(!0);var r=e.getModuleId(N);r&&M.trigger("router:navigation:to:"+r),a(t)||M.updateDocumentTitle(t,n),v.explicitNavigation=!1,v.navigatingBack=!1,M.trigger("router:navigation:complete",t,n,M)}function p(t,n){e.log("Navigation Cancelled"),M.activeInstruction(O),O&&M.navigate(O.fragment,!1),T(!1),v.explicitNavigation=!1,v.navigatingBack=!1,M.trigger("router:navigation:cancelled",t,n,M)}function m(t){e.log("Navigation Redirecting"),T(!1),v.explicitNavigation=!1,v.navigatingBack=!1,M.navigate(t,{trigger:!0,replace:!0})}function h(t,n,i){v.navigatingBack=!v.explicitNavigation&&N!=i.fragment,M.trigger("router:route:activating",n,i,M),t.activateItem(n,i.params).then(function(e){if(e){var r=N;if(g(n,i),a(n)){var o=i.fragment;i.queryString&&(o+="?"+i.queryString),n.router.loadUrl(o)}r==n&&(M.attached(),M.compositionComplete())}else t.settings.lifecycleData&&t.settings.lifecycleData.redirect?m(t.settings.lifecycleData.redirect):p(n,i);f&&(f.resolve(),f=null)}).fail(function(t){e.error(t)})}function w(t,n,i){var a=M.guardRoute(n,i);a?a.then?a.then(function(a){a?e.isString(a)?m(a):h(t,n,i):p(n,i)}):e.isString(a)?m(a):h(t,n,i):p(n,i)}function k(e,t,n){M.guardRoute?w(e,t,n):h(e,t,n)}function _(e){return O&&O.config.moduleId==e.config.moduleId&&N&&(N.canReuseForRoute&&N.canReuseForRoute.apply(N,e.params)||!N.canReuseForRoute&&N.router&&N.router.loadUrl)}function x(){if(!T()){var t=C.shift();C=[],t&&(T(!0),M.activeInstruction(t),_(t)?k(n.create(),N,t):e.acquire(t.config.moduleId).then(function(n){var i=e.resolveObject(n);k(V,i,t)}).fail(function(n){e.error("Failed to load routed module ("+t.config.moduleId+"). Details: "+n.message)}))}}function I(e){C.unshift(e),x()}function S(e,t,n){for(var i=e.exec(t).slice(1),a=0;a<i.length;a++){var r=i[a];i[a]=r?decodeURIComponent(r):null}var o=M.parseQueryString(n);return o&&i.push(o),{params:i,queryParams:o}}function D(t){M.trigger("router:route:before-config",t,M),e.isRegExp(t)?t.routePattern=t.route:(t.title=t.title||M.convertRouteToTitle(t.route),t.moduleId=t.moduleId||M.convertRouteToModuleId(t.route),t.hash=t.hash||M.convertRouteToHash(t.route),t.routePattern=c(t.route)),t.isActive=t.isActive||o.observable(!1),M.trigger("router:route:after-config",t,M),M.routes.push(t),M.route(t.routePattern,function(e,n){var i=S(t.routePattern,e,n);I({fragment:e,queryString:n,config:t,params:i.params,queryParams:i.queryParams})})}function A(t){if(e.isArray(t.route))for(var n=t.isActive||o.observable(!1),i=0,a=t.route.length;a>i;i++){var r=e.extend({},t);r.route=t.route[i],r.isActive=n,i>0&&delete r.nav,D(r)}else D(t);return M}var N,O,C=[],T=o.observable(!1),V=n.create(),M={handlers:[],routes:[],navigationModel:o.observableArray([]),activeItem:V,isNavigating:o.computed(function(){var e=V(),t=T(),n=e&&e.router&&e.router!=M&&e.router.isNavigating()?!0:!1;return t||n}),activeInstruction:o.observable(null),__router__:!0};return i.includeIn(M),V.settings.areSameItem=function(e,t,n,i){return e==t?d(n,i):!1},M.parseQueryString=function(e){var t,n;if(!e)return null;if(n=e.split("&"),0==n.length)return null;t={};for(var i=0;i<n.length;i++){var a=n[i];if(""!==a){var r=a.split("=");t[r[0]]=r[1]&&decodeURIComponent(r[1].replace(/\+/g," "))}}return t},M.route=function(e,t){M.handlers.push({routePattern:e,callback:t})},M.loadUrl=function(t){var n=M.handlers,i=null,a=t,o=t.indexOf("?");if(-1!=o&&(a=t.substring(0,o),i=t.substr(o+1)),M.relativeToParentRouter){var s=this.parent.activeInstruction();a=s.params.join("/"),a&&"/"==a.charAt(0)&&(a=a.substr(1)),a||(a=""),a=a.replace("//","/").replace("//","/")}a=a.replace(b,"");for(var c=0;c<n.length;c++){var u=n[c];if(u.routePattern.test(a))return u.callback(a,i),!0}return e.log("Route Not Found"),M.trigger("router:route:not-found",t,M),O&&r.navigate(O.fragment,{trigger:!1,replace:!0}),v.explicitNavigation=!1,v.navigatingBack=!1,!1},M.updateDocumentTitle=function(e,n){n.config.title?document.title=t.title?n.config.title+" | "+t.title:n.config.title:t.title&&(document.title=t.title)},M.navigate=function(e,t){return e&&-1!=e.indexOf("://")?(window.location.href=e,!0):(v.explicitNavigation=!0,r.navigate(e,t))},M.navigateBack=function(){r.navigateBack()},M.attached=function(){M.trigger("router:navigation:attached",N,O,M)},M.compositionComplete=function(){T(!1),M.trigger("router:navigation:composition-complete",N,O,M),x()},M.convertRouteToHash=function(e){if(M.relativeToParentRouter){var t=M.parent.activeInstruction(),n=t.config.hash+"/"+e;return r._hasPushState&&(n="/"+n),n=n.replace("//","/").replace("//","/")}return r._hasPushState?e:"#"+e},M.convertRouteToModuleId=function(e){return u(e)},M.convertRouteToTitle=function(e){var t=u(e);return t.substring(0,1).toUpperCase()+t.substring(1)},M.map=function(t,n){if(e.isArray(t)){for(var i=0;i<t.length;i++)M.map(t[i]);return M}return e.isString(t)||e.isRegExp(t)?(n?e.isString(n)&&(n={moduleId:n}):n={},n.route=t):n=t,A(n)},M.buildNavigationModel=function(t){for(var n=[],i=M.routes,a=t||100,r=0;r<i.length;r++){var o=i[r];o.nav&&(e.isNumber(o.nav)||(o.nav=++a),n.push(o))}return n.sort(function(e,t){return e.nav-t.nav}),M.navigationModel(n),M},M.mapUnknownRoutes=function(t,n){var i="*catchall",a=c(i);return M.route(a,function(o,s){var c=S(a,o,s),u={fragment:o,queryString:s,config:{route:i,routePattern:a},params:c.params,queryParams:c.queryParams};if(t)if(e.isString(t))u.config.moduleId=t,n&&r.navigate(n,{trigger:!1,replace:!0});else if(e.isFunction(t)){var l=t(u);if(l&&l.then)return l.then(function(){M.trigger("router:route:before-config",u.config,M),M.trigger("router:route:after-config",u.config,M),I(u)}),void 0}else u.config=t,u.config.route=i,u.config.routePattern=a;else u.config.moduleId=o;M.trigger("router:route:before-config",u.config,M),M.trigger("router:route:after-config",u.config,M),I(u)}),M},M.reset=function(){return O=N=void 0,M.handlers=[],M.routes=[],M.off(),delete M.options,M},M.makeRelative=function(t){return e.isString(t)&&(t={moduleId:t,route:t}),t.moduleId&&!l(t.moduleId,"/")&&(t.moduleId+="/"),t.route&&!l(t.route,"/")&&(t.route+="/"),t.fromParent&&(M.relativeToParentRouter=!0),M.on("router:route:before-config").then(function(e){t.moduleId&&(e.moduleId=t.moduleId+e.moduleId),t.route&&(e.route=""===e.route?t.route.substring(0,t.route.length-1):t.route+e.route)}),M},M.createChildRouter=function(){var e=y();return e.parent=M,e},M};return v=y(),v.explicitNavigation=!1,v.navigatingBack=!1,v.targetIsThisWindow=function(e){var t=s(e.target).attr("target");return!t||t===window.name||"_self"===t||"top"===t&&window===window.top?!0:!1},v.activate=function(t){return e.defer(function(n){if(f=n,v.options=e.extend({routeHandler:v.loadUrl},v.options,t),r.activate(v.options),r._hasPushState)for(var i=v.routes,a=i.length;a--;){var o=i[a];o.hash=o.hash.replace("#","")}s(document).delegate("a","click",function(e){if(r._hasPushState){if(!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&v.targetIsThisWindow(e)){var t=s(this).attr("href");null==t||"#"===t.charAt(0)||/^[a-z]+:/i.test(t)||(v.explicitNavigation=!0,e.preventDefault(),r.navigate(t))}}else v.explicitNavigation=!0}),r.options.silent&&f&&(f.resolve(),f=null)}).promise()},v.deactivate=function(){r.deactivate()},v.install=function(){o.bindingHandlers.router={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,i,r){var s=o.utils.unwrapObservable(t())||{};if(s.__router__)s={model:s.activeItem(),attached:s.attached,compositionComplete:s.compositionComplete,activate:!1};else{var c=o.utils.unwrapObservable(s.router||i.router)||v;s.model=c.activeItem(),s.attached=c.attached,s.compositionComplete=c.compositionComplete,s.activate=!1}a.compose(e,s,r)}},o.virtualElements.allowedBindings.router=!0},v});
define('viewmodels/shell',["plugins/router","durandal/app","data/leagueData"],function(e,a,t){return{router:e,search:function(){a.showMessage("Search not yet implemented...")},adminLinks:ko.computed(function(){return ko.utils.arrayFilter(e.navigationModel(),function(e){return e.adminLink===!0})}),regularLinks:ko.computed(function(){return ko.utils.arrayFilter(e.navigationModel(),function(e){return e.adminLink!==!0})}),activate:function(){ko.bindingHandlers.shortDate={init:function(e,a){var t=a();$(e).text(moment(t).format("MMMM Do YYYY"))}},ko.bindingHandlers.shortTime={init:function(e,a){var t=a();$(e).text(moment(t).format("h:mm a"))}},ko.bindingHandlers.dateTime={init:function(e,a){var t=a(),n=ko.unwrap(t);$(e).text(moment(n).format("MM/DD/YYYY h:mm a"))}},ko.bindingHandlers.datepicker={init:function(e,a,t){var n=t().datepickerOptions||{};$(e).datetimepicker(n),ko.utils.registerEventHandler(e,"changeDate",function(e){var t=a();ko.isObservable(t)&&t(e.date)})},update:function(e,a){var t=$(e).data("datetimepicker");if(t){var n=ko.utils.unwrapObservable(a());n&&(t.date=new Date(ko.utils.unwrapObservable(a())),t.setValue())}}},ko.bindingHandlers.markdown={update:function(e,a){var t=ko.utils.unwrapObservable(a()),n=t&&(new Showdown.converter).makeHtml(t);$(e).html(n||"")}},e.map([{route:"",title:"Home",moduleId:"viewmodels/home",nav:!0},{route:"!fullschedule",title:"Full Schedule",moduleId:"viewmodels/fullschedule",nav:!0},{route:"!standings",title:"Standings",moduleId:"viewmodels/standings",nav:!0},{route:"!teams",title:"Teams",moduleId:"viewmodels/teams",nav:!0},{route:"!teams/:name",title:"Teams",moduleId:"viewmodels/teamschedule",nav:!1},{route:"!locations",title:"Locations",moduleId:"viewmodels/locations",nav:!0},{route:"!locations/:name",title:"Locations",moduleId:"viewmodels/locationschedule",nav:!1},{route:"!rules",title:"Rules",moduleId:"viewmodels/rules",nav:!0},{route:"/leagues",hash:"/",title:"Switch Leagues",nav:!0}]).buildNavigationModel();var a=document.location.pathname.split("/"),n=a[1],o=3===a.length&&"preview"===a[2];return t.primeData(n,o).then(function(){return e.activate()})}}});
define('viewmodels/standings',["data/leagueData"],function(e){function a(){t.standings(e.data.standings),t.leagueName(e.data.league.name)}var t={activate:a,standings:ko.observableArray(),leagueName:ko.observable()};return t});
define('viewmodels/teams',["data/leagueData"],function(e){var a=this;return a.teams=ko.observableArray(),a.leagueName=ko.observable(),a.activate=function(){a.teams(e.data.teams),a.leagueName(e.data.league.name)},{activate:a.activate,teams:a.teams}});
define('viewmodels/teamschedule',["data/leagueData"],function(e){function a(a){n.title("Team Schedule for "+a);var o=_.chain(e.data.games).filter(function(e){return e.team1==a||e.team2==a}).map(function(e){var n=e.team1===a?!0:!1,o=n?e.team2:e.team1,i=t(n,e.team1Score,e.team2Score);return{opponent:o,time:e.time,location:e.location,locationUrl:e.locationUrl,scoreDisplay:i,homeAway:n?"vs.":"at"}}).value();return n.games(o),!0}function t(e,a,t){if(a&&t){var n=e?a:t,o=e?t:a,i=n>o?"W: ":"L: ";return i+n+"-"+o}return""}var n={activate:a,title:ko.observable(),games:ko.observableArray(),scoreDisplay:function(e){return console.log("inside score display",e),""}};return n});
define('text',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});
define('text!views/fullschedule.html',[],function () { return '<section>\r\n    <h2 data-bind="text: \'Full Schedule - \' + leagueName()"></h2>\r\n\r\n    <table class="table table-striped">\r\n        <thead>\r\n            <tr>\r\n                <th>Date</th>\r\n                <th>Time</th>\r\n                <th>Teams (Home team first)</th>\r\n                <th>Location</th>\r\n            </tr>\r\n        </thead>\r\n        <tbody data-bind="foreach: games">\r\n            <tr>\r\n                <td data-bind="shortDate: time"></td>\r\n                <td data-bind="shortTime: time"></td>\r\n                <td>\r\n                    <a data-bind="text: team1, attr: { href: \'#!teams/\' + team1 }"></a>\r\n                    <span data-bind="visible: team1Score, text: \'(\' + team1Score + \')\', css: { \'bold-text text-success\': team1Score > team2Score }"></span>\r\n                    <span> vs. </span>\r\n                    <a data-bind="text: team2, attr: { href: \'#!teams/\' + team2 }"></a>\r\n                    <span data-bind="visible: team2Score, text: \'(\' + team2Score + \')\', css: { \'bold-text text-success\': team2Score > team1Score }"></span>\r\n                </td>\r\n                <td>\r\n                    <a data-bind="text: location, attr: { href: \'#!locations/\' + location }"></a>\r\n                    (<a data-bind="attr: { href: locationUrl }">Map</a>)\r\n                </td>\r\n            </tr>\r\n        </tbody>\r\n    </table>\r\n\r\n</section>';});

define('text!views/home.html',[],function () { return '<section>\r\n    <h2 class="page-title" data-bind="text: \'Welcome to \' + leagueName"></h2>\r\n    <h3 data-bind="text: \'This site contains complete schedule information for the \' + leagueName"></h3>\r\n    <div data-bind="markdown: homeContent"></div>\r\n</section>';});

define('text!views/locations.html',[],function () { return '<section>\r\n    <h2 class="page-title" data-bind="text: \'Locations - \' + leagueName()"></h2>\r\n    <h3>Click on a location below to view schedule by location.</h3>\r\n\r\n    <div class="container" data-bind="foreach: locations">\r\n        <div class="row">\r\n            <a data-bind="text: name, attr: { href: \'#!locations/\' + name }"></a>\r\n            (<a data-bind="attr: { href: locationUrl }">Click here for Directions</a>)\r\n        </div>\r\n    </div>\r\n</section>';});

define('text!views/locationschedule.html',[],function () { return '<section>\r\n    <h2 data-bind="text: title"></h2>\r\n\r\n    <table class="table table-striped">\r\n        <thead>\r\n            <tr>\r\n                <th>Date</th>\r\n                <th>Time</th>\r\n                <th>Teams (Home team first)</th>\r\n            </tr>\r\n        </thead>\r\n        <tbody data-bind="foreach: games">\r\n            <tr>\r\n                <td data-bind="shortDate: time"></td>\r\n                <td data-bind="shortTime: time"></td>\r\n                <td>\r\n                    <a data-bind="text: team1, attr: { href: \'#!teams/\' + team1 }"></a>\r\n                    <!--<span data-bind="if: team1TakesScoreboard">\r\n                        <a data-bind="click: $parent.scoreboardAlert"><i class="icon-briefcase"></i></a>\r\n                    </span>-->\r\n                    <span> vs. </span>\r\n                    <a data-bind="text: team2, attr: { href: \'#!teams/\' + team2 }"></a>\r\n                    <!--<span data-bind="if: team2TakesScoreboard">\r\n                        <a data-bind="click: $parent.scoreboardAlert"><i class="icon-briefcase"></i></a>\r\n                    </span>-->\r\n                </td>\r\n            </tr>\r\n        </tbody>\r\n    </table>\r\n</section>';});

define('text!views/rules.html',[],function () { return '<section>\r\n    <h2 class="page-title" data-bind="text: \'League Rules - \' + leagueName"></h2>\r\n    <div data-bind="markdown: rulesContent"></div>\r\n</section>';});

define('text!views/shell.html',[],function () { return '<div>\r\n    <div class="navbar navbar-default navbar-fixed-top">\r\n        <div class="container-fluid">\r\n            <div class="navbar-header">\r\n                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">\r\n                    <span class="icon-bar"></span>\r\n                    <span class="icon-bar"></span>\r\n                    <span class="icon-bar"></span>\r\n                </button>\r\n                <!--<a class="navbar-brand" data-bind="attr: { href: router.navigationModel()[0].hash }">-->\r\n                <a class="navbar-brand" href="/">\r\n                    <!--<i class="glyphicon glyphicon-home"></i>-->\r\n                    <span>Elite Schedule</span>\r\n                </a>\r\n            </div>\r\n\r\n            <div class="collapse navbar-collapse">\r\n                <!--<ul class="nav navbar-nav" data-bind="foreach: router.navigationModel">-->\r\n                <ul class="nav navbar-nav">\r\n                    <!--ko foreach: regularLinks -->\r\n                    <li data-bind="css: { active: isActive }">\r\n                        <a data-toggle="collapse" data-target=".navbar-collapse" data-bind="attr: { href: hash }, html: title"></a>\r\n                    </li>\r\n                    <!--/ko-->\r\n\r\n                    <!--<li class="dropdown">\r\n                        <a class="dropdown-toggle" data-toggle="dropdown" href="#">\r\n                            Admin <span class="caret"></span>\r\n                        </a>\r\n                        <ul class="dropdown-menu" role="menu" data-bind="foreach: adminLinks">\r\n                            <li data-bind="css: { active: isActive }">\r\n                                <a data-toggle="collapse" data-target=".navbar-collapse" data-bind="attr: { href: hash }, html: title"></a>\r\n                            </li>\r\n                        </ul>\r\n                    </li>-->\r\n                </ul>\r\n                <div class="loader pull-right" data-bind="css: { active: router.isNavigating }">\r\n                    <i class="icon-spinner icon-2x icon-spin"></i>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class="container page-host" data-bind="router: { transition:\'entrance\', cacheViews:true }"></div>\r\n</div>';});

define('text!views/standings.html',[],function () { return '<section>\r\n    <h2 class="page-title" data-bind="text: \'Standings - \' + leagueName()"></h2>\r\n\r\n    <div class="container" data-bind="foreach: standings">\r\n        <h3 data-bind="text: divisionName"></h3>\r\n\r\n        <table class="table table-striped">\r\n            <thead>\r\n                <tr>\r\n                    <th>Team</th>\r\n                    <th>Won</th>\r\n                    <th>Lost</th>\r\n                    <th>Pct</th>\r\n                    <th>PF</th>\r\n                    <th>PA</th>\r\n                    <th>Diff</th>\r\n                </tr>\r\n            </thead>\r\n            <tbody data-bind="foreach: divisionStandings">\r\n                <tr>\r\n                    <td><a data-bind="text: teamName, attr: { href: \'#!teams/\' + teamName }"></a></td>\r\n                    <td data-bind="text: wins"></td>\r\n                    <td data-bind="text: losses"></td>\r\n                    <td data-bind="text: winningPct"></td>\r\n                    <td data-bind="text: pointsFor"></td>\r\n                    <td data-bind="text: pointsAgainst"></td>\r\n                    <td data-bind="text: pointsDiff"></td>\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n    </div>\r\n</section>';});

define('text!views/teams.html',[],function () { return '<section>\r\n    <!--<h2 class="page-title">Teams</h2>-->\r\n    <h2 class="page-title" data-bind="text: \'Teams - \' + leagueName()"></h2>\r\n    <h3>Click on a team below to view schedule by team.</h3>\r\n\r\n    <div class="container" data-bind="foreach: teams">\r\n        <h3 data-bind="text: divisionName"></h3>\r\n\r\n        <table class="table table-striped">\r\n            <thead>\r\n                <tr>\r\n                    <th>Team</th>\r\n                    <th>Coach</th>\r\n                </tr>\r\n            </thead>\r\n            <tbody data-bind="foreach: divisionTeams">\r\n                <tr>\r\n                    <td>\r\n                        <a class="btn btn-link" data-bind="text: name, attr: { href: \'#!teams/\'+name }"></a>\r\n                    </td>\r\n                    <td data-bind="text: coach"></td>\r\n                </tr>\r\n            </tbody>\r\n        </table>\r\n\r\n    </div>\r\n</section>';});

define('text!views/teamschedule.html',[],function () { return '<section>\r\n    <h2 data-bind="text: title"></h2>\r\n\r\n    <table class="table table-striped">\r\n        <thead>\r\n            <tr>\r\n                <th>Date</th>\r\n                <th>Time</th>\r\n                <th></th>\r\n                <th>Opponent</th>\r\n                <th>Location</th>\r\n                <th>Result</th>\r\n            </tr>\r\n        </thead>\r\n        <tbody data-bind="foreach: games">\r\n            <tr>\r\n                <td data-bind="shortDate: time"></td>\r\n                <td data-bind="shortTime: time"></td>\r\n                <td data-bind="text: homeAway"></td>\r\n                <td>\r\n                    <a data-bind="text: opponent, attr: { href: \'#!teams/\' + opponent }"></a>\r\n                </td>\r\n                <td>\r\n                    <a data-bind="text: location, attr: { href: \'#!locations/\' + location }"></a>\r\n                    (<a data-bind="attr: { href: locationUrl }">Map</a>)\r\n                </td>\r\n                <!--<td data-bind="text: $parent.scoreDisplay($data)"></td>-->\r\n                <td data-bind="text: scoreDisplay"></td>\r\n            </tr>\r\n        </tbody>\r\n    </table>\r\n</section>';});

define('plugins/dialog',["durandal/system","durandal/app","durandal/composition","durandal/activator","durandal/viewEngine","jquery","knockout"],function(e,t,i,n,a,o,r){function s(t){return e.defer(function(i){e.isString(t)?e.acquire(t).then(function(t){i.resolve(e.resolveObject(t))}).fail(function(i){e.error("Failed to load dialog module ("+t+"). Details: "+i.message)}):i.resolve(t)}).promise()}var c,l={},u=0,d=function(e,t,i){this.message=e,this.title=t||d.defaultTitle,this.options=i||d.defaultOptions};return d.prototype.selectOption=function(e){c.close(this,e)},d.prototype.getView=function(){return a.processMarkup(d.defaultViewMarkup)},d.setViewUrl=function(e){delete d.prototype.getView,d.prototype.viewUrl=e},d.defaultTitle=t.title||"Application",d.defaultOptions=["Ok"],d.defaultViewMarkup=['<div data-view="plugins/messageBox" class="messageBox">','<div class="modal-header">','<h3 data-bind="text: title"></h3>',"</div>",'<div class="modal-body">','<p class="message" data-bind="text: message"></p>',"</div>",'<div class="modal-footer" data-bind="foreach: options">','<button class="btn" data-bind="click: function () { $parent.selectOption($data); }, text: $data, css: { \'btn-primary\': $index() == 0, autofocus: $index() == 0 }"></button>',"</div>","</div>"].join("\n"),c={MessageBox:d,currentZIndex:1050,getNextZIndex:function(){return++this.currentZIndex},isOpen:function(){return u>0},getContext:function(e){return l[e||"default"]},addContext:function(e,t){t.name=e,l[e]=t;var i="show"+e.substr(0,1).toUpperCase()+e.substr(1);this[i]=function(t,i){return this.show(t,i,e)}},createCompositionSettings:function(e,t){var i={model:e,activate:!1,transition:!1};return t.attached&&(i.attached=t.attached),t.compositionComplete&&(i.compositionComplete=t.compositionComplete),i},getDialog:function(e){return e?e.__dialog__:void 0},close:function(e){var t=this.getDialog(e);if(t){var i=Array.prototype.slice.call(arguments,1);t.close.apply(t,i)}},show:function(t,a,o){var r=this,c=l[o||"default"];return e.defer(function(e){s(t).then(function(t){var o=n.create();o.activateItem(t,a).then(function(n){if(n){var a=t.__dialog__={owner:t,context:c,activator:o,close:function(){var i=arguments;o.deactivateItem(t,!0).then(function(n){n&&(u--,c.removeHost(a),delete t.__dialog__,0===i.length?e.resolve():1===i.length?e.resolve(i[0]):e.resolve.apply(e,i))})}};a.settings=r.createCompositionSettings(t,c),c.addHost(a),u++,i.compose(a.host,a.settings)}else e.resolve(!1)})})}).promise()},showMessage:function(t,i,n){return e.isString(this.MessageBox)?c.show(this.MessageBox,[t,i||d.defaultTitle,n||d.defaultOptions]):c.show(new this.MessageBox(t,i,n))},install:function(e){t.showDialog=function(e,t,i){return c.show(e,t,i)},t.showMessage=function(e,t,i){return c.showMessage(e,t,i)},e.messageBox&&(c.MessageBox=e.messageBox),e.messageBoxView&&(c.MessageBox.prototype.getView=function(){return e.messageBoxView})}},c.addContext("default",{blockoutOpacity:.2,removeDelay:200,addHost:function(e){var t=o("body"),i=o('<div class="modalBlockout"></div>').css({"z-index":c.getNextZIndex(),opacity:this.blockoutOpacity}).appendTo(t),n=o('<div class="modalHost"></div>').css({"z-index":c.getNextZIndex()}).appendTo(t);if(e.host=n.get(0),e.blockout=i.get(0),!c.isOpen()){e.oldBodyMarginRight=t.css("margin-right"),e.oldInlineMarginRight=t.get(0).style.marginRight;var a=o("html"),r=t.outerWidth(!0),s=a.scrollTop();o("html").css("overflow-y","hidden");var l=o("body").outerWidth(!0);t.css("margin-right",l-r+parseInt(e.oldBodyMarginRight,10)+"px"),a.scrollTop(s)}},removeHost:function(e){if(o(e.host).css("opacity",0),o(e.blockout).css("opacity",0),setTimeout(function(){r.removeNode(e.host),r.removeNode(e.blockout)},this.removeDelay),!c.isOpen()){var t=o("html"),i=t.scrollTop();t.css("overflow-y","").scrollTop(i),e.oldInlineMarginRight?o("body").css("margin-right",e.oldBodyMarginRight):o("body").css("margin-right","")}},attached:function(e){o(e).css("visibility","hidden")},compositionComplete:function(e,t,i){var n=c.getDialog(i.model),a=o(e),r=a.find("img").filter(function(){var e=o(this);return!(this.style.width&&this.style.height||e.attr("width")&&e.attr("height"))});a.data("predefinedWidth",a.get(0).style.width);var s=function(){setTimeout(function(){a.data("predefinedWidth")||a.css({width:""});var e=a.outerWidth(!1),t=a.outerHeight(!1),i=o(window).height(),r=Math.min(t,i);a.css({"margin-top":(-r/2).toString()+"px","margin-left":(-e/2).toString()+"px"}),a.data("predefinedWidth")||a.outerWidth(e),t>i?a.css("overflow-y","auto"):a.css("overflow-y",""),o(n.host).css("opacity",1),a.css("visibility","visible"),a.find(".autofocus").first().focus()},1)};s(),r.load(s),a.hasClass("autoclose")&&o(n.blockout).click(function(){n.close()})}}),c});
define('plugins/observable',["durandal/system","durandal/binder","knockout"],function(e,t,n){function a(e){var t=e[0];return"_"===t||"$"===t}function i(t){return!(!t||void 0===t.nodeType||!e.isNumber(t.nodeType))}function r(e){if(!e||i(e)||e.ko===n||e.jquery)return!1;var t=f.call(e);return-1==v.indexOf(t)&&!(e===!0||e===!1)}function o(e,t){var n=e.__observable__,a=!0;if(!n||!n.__full__){n=n||(e.__observable__={}),n.__full__=!0,g.forEach(function(n){e[n]=function(){a=!1;var e=b[n].apply(t,arguments);return a=!0,e}}),m.forEach(function(n){e[n]=function(){a&&t.valueWillMutate();var i=h[n].apply(e,arguments);return a&&t.valueHasMutated(),i}}),p.forEach(function(n){e[n]=function(){for(var i=0,r=arguments.length;r>i;i++)s(arguments[i]);a&&t.valueWillMutate();var o=h[n].apply(e,arguments);return a&&t.valueHasMutated(),o}}),e.splice=function(){for(var n=2,i=arguments.length;i>n;n++)s(arguments[n]);a&&t.valueWillMutate();var r=h.splice.apply(e,arguments);return a&&t.valueHasMutated(),r};for(var i=0,r=e.length;r>i;i++)s(e[i])}}function s(t){var i,s;if(r(t)&&(i=t.__observable__,!i||!i.__full__)){if(i=i||(t.__observable__={}),i.__full__=!0,e.isArray(t)){var c=n.observableArray(t);o(t,c)}else for(var u in t)a(u)||i[u]||(s=t[u],e.isFunction(s)||l(t,u,s));y&&e.log("Converted",t)}}function c(e,t,n){var a;e(t),a=e.peek(),n?a?a.destroyAll||o(a,e):(a=[],e(a),o(a,e)):s(a)}function l(t,a,i){var r,l,u=t.__observable__||(t.__observable__={});if(void 0===i&&(i=t[a]),e.isArray(i))r=n.observableArray(i),o(i,r),l=!0;else if("function"==typeof i){if(!n.isObservable(i))return null;r=i}else e.isPromise(i)?(r=n.observable(),i.then(function(t){if(e.isArray(t)){var a=n.observableArray(t);o(t,a),t=a}r(t)})):(r=n.observable(i),s(i));return Object.defineProperty(t,a,{configurable:!0,enumerable:!0,get:r,set:n.isWriteableObservable(r)?function(t){t&&e.isPromise(t)?t.then(function(t){c(r,t,e.isArray(t))}):c(r,t,l)}:void 0}),u[a]=r,r}function u(t,a,i){var r,o={owner:t,deferEvaluation:!0};return"function"==typeof i?o.read=i:("value"in i&&e.error('For defineProperty, you must not specify a "value" for the property. You must provide a "get" function.'),"function"!=typeof i.get&&e.error('For defineProperty, the third parameter must be either an evaluator function, or an options object containing a function called "get".'),o.read=i.get,o.write=i.set),r=n.computed(o),t[a]=r,l(t,a,r)}var d,f=Object.prototype.toString,v=["[object Function]","[object String]","[object Boolean]","[object Number]","[object Date]","[object RegExp]"],g=["remove","removeAll","destroy","destroyAll","replace"],m=["pop","reverse","sort","shift","splice"],p=["push","unshift"],h=Array.prototype,b=n.observableArray.fn,y=!1;return d=function(e,t){var a,i,r;return e?(a=e.__observable__,a&&(i=a[t])?i:(r=e[t],n.isObservable(r)?r:l(e,t,r))):null},d.defineProperty=u,d.convertProperty=l,d.convertObject=s,d.install=function(e){var n=t.binding;t.binding=function(e,t,a){a.applyBindings&&!a.skipConversion&&s(e),n(e,t)},y=e.logConversion},d});
define('plugins/serializer',["durandal/system"],function(e){return{typeAttribute:"type",space:void 0,replacer:function(e,t){if(e){var n=e[0];if("_"===n||"$"===n)return void 0}return t},serialize:function(t,n){return n=void 0===n?{}:n,(e.isString(n)||e.isNumber(n))&&(n={space:n}),JSON.stringify(t,n.replacer||this.replacer,n.space||this.space)},getTypeId:function(e){return e?e[this.typeAttribute]:void 0},typeMap:{},registerType:function(){var t=arguments[0];if(1==arguments.length){var n=t[this.typeAttribute]||e.getModuleId(t);this.typeMap[n]=t}else this.typeMap[t]=arguments[1]},reviver:function(e,t,n,i){var a=n(t);if(a){var r=i(a);if(r)return r.fromJSON?r.fromJSON(t):new r(t)}return t},deserialize:function(e,t){var n=this;t=t||{};var i=t.getTypeId||function(e){return n.getTypeId(e)},a=t.getConstructor||function(e){return n.typeMap[e]},r=t.reviver||function(e,t){return n.reviver(e,t,i,a)};return JSON.parse(e,r)}}});
define('plugins/widget',["durandal/system","durandal/composition","jquery","knockout"],function(e,t,n,i){function a(e,n){var a=i.utils.domData.get(e,u);a||(a={parts:t.cloneNodes(i.virtualElements.childNodes(e))},i.virtualElements.emptyNode(e),i.utils.domData.set(e,u,a)),n.parts=a.parts}var r={},o={},s=["model","view","kind"],u="durandal-widget-data",c={getSettings:function(t){var n=i.utils.unwrapObservable(t())||{};if(e.isString(n))return{kind:n};for(var a in n)n[a]=-1!=i.utils.arrayIndexOf(s,a)?i.utils.unwrapObservable(n[a]):n[a];return n},registerKind:function(e){i.bindingHandlers[e]={init:function(){return{controlsDescendantBindings:!0}},update:function(t,n,i,r,o){var s=c.getSettings(n);s.kind=e,a(t,s),c.create(t,s,o,!0)}},i.virtualElements.allowedBindings[e]=!0,t.composeBindings.push(e+":")},mapKind:function(e,t,n){t&&(o[e]=t),n&&(r[e]=n)},mapKindToModuleId:function(e){return r[e]||c.convertKindToModulePath(e)},convertKindToModulePath:function(e){return"widgets/"+e+"/viewmodel"},mapKindToViewId:function(e){return o[e]||c.convertKindToViewPath(e)},convertKindToViewPath:function(e){return"widgets/"+e+"/view"},createCompositionSettings:function(e,t){return t.model||(t.model=this.mapKindToModuleId(t.kind)),t.view||(t.view=this.mapKindToViewId(t.kind)),t.preserveContext=!0,t.activate=!0,t.activationData=t,t.mode="templated",t},create:function(e,n,i,a){a||(n=c.getSettings(function(){return n},e));var r=c.createCompositionSettings(e,n);t.compose(e,r,i)},install:function(e){if(e.bindingName=e.bindingName||"widget",e.kinds)for(var n=e.kinds,r=0;r<n.length;r++)c.registerKind(n[r]);i.bindingHandlers[e.bindingName]={init:function(){return{controlsDescendantBindings:!0}},update:function(e,t,n,i,r){var o=c.getSettings(t);a(e,o),c.create(e,o,r,!0)}},t.composeBindings.push(e.bindingName+":"),i.virtualElements.allowedBindings[e.bindingName]=!0}};return c});
define('transitions/entrance',["durandal/system","durandal/composition","jquery"],function(e,t,n){var i=100,r={marginRight:0,marginLeft:0,opacity:1},a={marginLeft:"",marginRight:"",opacity:"",display:""},o=function(t){return e.defer(function(e){function o(){e.resolve()}function u(){t.keepScrollPosition||n(document).scrollTop(0)}function s(){u(),t.triggerAttach();var e={marginLeft:l?"0":"20px",marginRight:l?"0":"-20px",opacity:0,display:"block"},i=n(t.child);i.css(e),i.animate(r,{duration:c,easing:"swing",always:function(){i.css(a),o()}})}if(t.child){var c=t.duration||500,l=!!t.fadeOnly;t.activeView?n(t.activeView).fadeOut({duration:i,always:s}):s()}else n(t.activeView).fadeOut(i,o)}).promise()};return o});
require(["main"]);
}());