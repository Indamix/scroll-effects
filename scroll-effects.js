(function(){

    var numRE = /(\d+\.?\d*)/,
        exported = false,
        options, win;

    if (typeof window.jQuery === 'function') {
        $.fn.scrollEffects = main;
        exported = true;
    }

    if (typeof define !== 'undefined' && define.amd) {
        define(function () {
            return main;
        });
        exported = true;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = main;
        exported = true;
    }

    if (!exported) {
        window.scrollEffects = main;
    }

    function main (params) {
        if (window.$ && this instanceof $ && this.length) {
            params.elm = this;
            params = [params];
        }

        if (options) {
            options = options.concat(parse(params));
        } else {
            options = parse(params);
            win = $(window);
            win.on('scroll', onScroll);
        }

        onScroll();
    }

    function parse (options) {
        var item;
        for (var i = options.length; i--;) {
            item = options[i];
            for (var k in item) {
                if (k === 'elm') continue;
                if (typeof item[k] === 'object') {
                    item[k] = precompile(item[k]);
                }
            }
        }

        return options;
    }

    function precompile (options) {
        var stops = [];
        for (var timestamp in options) {
            stops.push(+timestamp, split(options[timestamp]));
        }
        // console.log('stops', stops)

        var compiled = [],
            s = '';

        for (var i = 0, length = stops[1].length; i < length; i++) {
            var equal = true;
            for (var j = 1; j < stops.length - 2; j += 2) {
                if (stops[j][i] !== stops[j + 2][i]) {
                    equal = false;
                    break;
                }
            }

            if (equal) {
                s += stops[1][i];
            } else {
                var a = [];
                for (var j = 1; j < stops.length; j += 2) {
                    a.push(stops[j - 1], stops[j][i]);
                }
                compiled.push(s, a);
                s = '';
            }
        }
        if (s) compiled.push(s);
        // console.log('compiled', compiled)
        return compiled;
    }

    function split (s) {
        if (typeof s === 'number') return [s];

        var a = s.split(numRE),
            i, item;
        for (i = a.length; i--;) {
            item = parseFloat(a[i]);
            if (item === item) a[i] = item;
        }

        return a;
    }

    function onScroll (e) {
        var scrollTop = win.scrollTop(),
            item, offset, css;

        for (var i = options.length; i--;) {
            item = options[i];
            css = {};
            for (var k in item) {
                if (k === 'elm') continue;
                if (typeof item[k] === 'function') {
                    css[k] = item[k](scrollTop);
                } else {
                    css[k] = compile(item[k], scrollTop);
                }
            }
            item.elm.css(css);
        }
    }

    function compile (data, x) {
        var s = '';
        for (var i = 0; i < data.length; ++i) {
            s += typeof data[i] === 'string' ? data[i] : interpolate(data[i], x);
        }
        return s;
    }

    function interpolate (data, x) {
        var l = data.length;
        if (x <= data[0])     return data[1];
        if (x >= data[l - 2]) return data[l - 1];

        var min = 0,
            max = l - 2,
            i;
        while (max - min > 2) {
            i = min + max >> 2 << 1;
            if (data[i] > x) {
                max = i;
            } else {
                min = i;
            }
        }
        i = min;

        // if (data[i] > x || data[i + 2] < x) {
        //     console.log(data[i], x, data[i + 2])
        //     debugger;
        // }

        k = (data[i + 3] - data[i + 1]) / (data[i + 2] - data[i]);
        return data[i + 1] + k * (x - data[i]);
    }

})();