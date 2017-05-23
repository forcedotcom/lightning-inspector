import _ from 'lodash';

// NOTE object deep-patch module

export class EventWrapper {
  children = {};
  parent = null;

  constructor(id, event) {
    this.id = id;
    this.event = event;
  }
}

class Parser {
  events = [];

  constructor(events) {
    this.events = events;
  }

  getParsed() {
    let { events } = this;

    events = this._validate(events, 0);
    events = this._parse(events);
    events = this._aggregate(events);

    return events;
  }

  _validate(events, depth, wrappedParentEvent = {}) {
    return _.compact(_.flatten(_.map(events, event => {
      try {
        event = this.validate(
          event,
          wrappedParentEvent.event,
          depth
        );

        const id = this.getId(
          event,
          wrappedParentEvent.event,
          depth
        );

        const wrappedEvent = new EventWrapper(id, event);
        const childEventsByKey = this.getChildren(wrappedEvent.event, wrappedParentEvent.event);

        _.each(
          childEventsByKey,
          (childEvents, key) => {
            const wrappedChildEvents = this._validate(
              childEvents,
              depth + 1,
              wrappedEvent
            );

            wrappedEvent.children[key] = wrappedChildEvents;

            _.each(
              wrappedChildEvents,
              wrappedChildEvent => wrappedChildEvent.parent = wrappedEvent
            );
          });

        return wrappedEvent;
      } catch (e) {
        console.error(e);
      }
    })));
  }

  _parse(wrappedEvents, allWrappedEvent = {}, wrappedParentEvent = {}, wrappedEventsArray = []) {
    wrappedEventsArray.push(..._.compact(_.map(
      wrappedEvents,
      wrappedEvent => {
        try {
          wrappedEvent.event = this.parse(
            wrappedEvent.event,
            wrappedParentEvent.event
          );

          allWrappedEvent[wrappedEvent.id] = wrappedEvent;

          _.each(wrappedEvent.children, wrappedChildrenEvents => {
            this._parse(
              wrappedChildrenEvents,
              allWrappedEvent,
              wrappedEvent,
              wrappedEventsArray
            );
          });

          return wrappedEvent;
        } catch (e) {
          console.error(e);
        }
      })));

    return wrappedEventsArray
  }

  _aggregate(wrappedEvents, aggregation = {}) {
    _.each(wrappedEvents, wrappedEvent => {
      try {
        const childrenIds = _.map(
          _.flatten(
            _.values(wrappedEvent.children)
          ),
          'id'
        );

        let wrappedParentEvent = {};

        if (wrappedEvent.parent != null) {
          wrappedParentEvent = wrappedEvent.parent;
        }

        const aggregate = this.map(
          wrappedEvent.id,
          wrappedEvent.event,
          childrenIds, // TODO don't flatten
          wrappedParentEvent.parent,
          wrappedParentEvent.event
        );

        if (aggregate != null) {
          _.merge(aggregation, aggregate);
        }
      } catch (e) {
        console.error(e);
      }
    });

    return aggregation;
  }

  validate(event, parentEvent) {
    return event;
  }

  parse(event, parentEvent) {
    return { event };
  }

  map(id, event, children, parentId, parentEvent) {
    return { [id]: event, [id]: children };
  }

  getChildren(event) {
    return {};
  }

  getId(event, type, parentEvent) {
    return _.uniqueId('_');
  }
}

export default Parser;
