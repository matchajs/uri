/**
 *
 * Location Models
 *
 * @author kidney<kidneyleung@gmail.com>
 *
 */
define(function(require, exports, module) {
var $ = require('jquery'),

// Helper
win = window, TRUE = true, FALSE = false, UNDEFINED = undefined;

    function urlEncode(s) {
        return encodeURIComponent(String(s));
    }

    function urlDecode(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val == null || (t !== 'object' && t !== 'function');
    }

    function endsWith(str, suffix) {
        var ind = str.length - suffix.length;
        return ind >= 0 && str.indexOf(suffix, ind) == ind;
    }


    module.exports = {
        parseURL: function(url) {
            var pattern = /^(?:([A-Za-z]+):(\/{0,3}))?([0-9.\-A-Za-z]+\.[0-9A-Za-z]+)?(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
                cfgArr = ['url', 'scheme', 'slash', 'host', 'port', 'path', 'query', 'hash'],
                execRow = pattern.exec(url), row = {};

            for (var i = 0, len = cfgArr.length; i < len; ++i) {
                row[cfgArr[i]] = execRow[i] || '';
            }

            return row;
        },

        /**
         * Creates a serialized string of an array or object.
         *
         * for example:
         *     @example
         *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
         *     {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         *     {foo: TRUE, bar: 2}    // -> 'foo=TRUE&bar=2'
         *
         * @param {Object} o json data
         * @param {Object} config
         *                  [sep='&'] separator between each pair of data
         *                  [eq='='] separator between key and value of data
         *                  [serializeArray =TRUE] whether add '[]' to array key of data
         * @return {String}
         */
        param: function(o, options) {
            if (!$.isPlainObject(o)) {
                return '';
            }

            options = options || {};

            var sep = options.sep || '&',
                eq = options.eq || '=',
                serializeArray = !options.isSerializeArray ? TRUE : FALSE;

            var buf = [], key, i, v, len, val;
            for (key in o) {
                val = o[key];
                key = urlEncode(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (val !== UNDEFINED) {
                        buf.push(eq, urlEncode(val + ''));
                    }
                    buf.push(sep);
                }
                // val is not empty array
                else if ($.isArray(val) && val.length) {
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, (serializeArray ? urlEncode('[]') : ''));
                            if (v !== UNDEFINED) {
                                buf.push(eq, urlEncode(v + ''));
                            }
                            buf.push(sep);
                        }
                    }
                }
                // ignore other cases, including empty array, Function, RegExp, Date etc.

            }
            buf.pop();
            return buf.join('');
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         *
         * for example:
         *      @example
         *      'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         *      'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         *      'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         *      'id=45&raw'        // -> {id: '45', raw: ''}
         * @param {String} str param string
         * @param {Object} config
         *                  [sep='&'] separator between each pair of data
         *                  [eq='='] separator between key and value of data
         * @return {Object} json data
         */
        unparam: function(str, options) {
            if (typeof str != 'string' || !(str = $.trim(str))) {
                return {};
            }

            options = options || {};

            var sep = options.sep || '&',
                eq = options.eq || '=';

            var pairs = str.split(sep), ret = {},
                key, val, eqIndex, item;

            while (item = pairs.shift()) {
                eqIndex = item.indexOf(eq);
                if (eqIndex == -1) {
                    key = urlDecode(item);
                    val = UNDEFINED;
                } else {
                    // remember to decode key!
                    key = urlDecode(item.substring(0, eqIndex));
                    val = item.substring(eqIndex + 1);
                    try {
                        val = urlDecode(val);
                    } catch (e) {
                        console && console.log(e + 'decodeURIComponent error : ' + val);
                    }
                    if (endsWith(key, '[]')) {
                        key = key.substring(0, key.length - 2);
                    }
                }
                if (key in ret) {
                    if ($.isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [ret[key], val];
                    }
                } else {
                    ret[key] = val;
                }
            }

            return ret;
        }
    };
});