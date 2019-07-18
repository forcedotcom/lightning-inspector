/**
 * This file is included in the InjectedScript, but is not run through the es2015 transform.
 * So all this code is not included in a use_strict directive, or transpiled.
 */

/** Doesn't work when used with use_strict */
exports.OnEventFire = function OnEventFire(output, config, params) {
    var startTime = performance.now();
    var eventId = 'event_' + startTime;
    var data = {
        id: eventId
    };

    this.Inspector.publish('AuraInspector:OnEventStart', data);

    var ret = config['fn'].call(config['scope'], params);

    var event = config['scope'];
    var source = event.getSource();

    data = {
        id: eventId,
        name: event
            .getDef()
            .getDescriptor()
            .getQualifiedName(),
        parameters: output(event.getParams()),
        sourceId: source ? source.getGlobalId() : '',
        startTime: startTime,
        endTime: performance.now(),
        type: event.getDef().getEventType()
    };

    // Having troubles with this in strict mode.
    // Should probably either remove this, or disable the use strict.
    try {
        data['caller'] = arguments.callee.caller.caller.caller + '';
    } catch (e) {}

    this.Inspector.publish('AuraInspector:OnEventEnd', data);

    return ret;
};
