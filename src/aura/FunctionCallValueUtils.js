export default class FunctionCallValueUtils {
    static isFCV(compiledFcv) {
        var devFcvPrefix = 'function (cmp, fn) { return ';
        var prodFcvPrefix = 'function (a,b){return';

        return (
            typeof compiledFcv === 'string' &&
            (compiledFcv.startsWith(devFcvPrefix) || compiledFcv.startsWith(prodFcvPrefix))
        );
    }

    static formatFCV(compiledFcv) {
        var devFcvPrefix = 'function (cmp, fn) { return ';
        var prodFcvPrefix = 'function (a,b){return';

        // FCV in Dev Mode, code will be different in Prod Mode so we'll do a separate block for that.
        if (compiledFcv.startsWith(devFcvPrefix)) {
            // Lets try to clean up the Function a bit to make it easier to read.
            compiledFcv =
                '{! ' +
                // remove the initial function() { portion and the ending }
                compiledFcv
                    .substr(devFcvPrefix.length, compiledFcv.length - devFcvPrefix.length - 1)
                    // change fn.method, to just method
                    .replace(/fn\.([a-zA-Z]+)\(/g, '$1(')
                    // Change cmp.get("v.val") to just v.val
                    .replace(/cmp\.get\(\"([a-zA-Z\._]+)\"\)/g, '$1')
                    // ensure consistent ending
                    .trim() +
                ' }';
        } else if (compiledFcv.startsWith(prodFcvPrefix)) {
            compiledFcv =
                '{! ' +
                // Strip beginning function() { and ending }
                compiledFcv
                    .substr(prodFcvPrefix.length, compiledFcv.length - prodFcvPrefix.length - 1)
                    // In prod, it's not fn.method its b.method, so change it to just method
                    .replace(/b\.([a-zA-Z]+)\(/g, '$1(')
                    // Again in Prod, it's a.get, not cmp.get, so remove a.get and end up with just v.property
                    .replace(/a\.get\(\"([a-zA-Z\._]+)\"\)/g, '$1')
                    // consistent ending
                    .trim() +
                ' }';
        }

        return compiledFcv;
    }
}
