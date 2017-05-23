import _ from 'lodash';
import { decodeContext, mergeContext, marksToTimings } from '../helpers/decode';

const isRectEmpty = rect => rect == null || (rect.top === 0 && rect.right === 0 && rect.left === 0 && rect.bottom === 0);

function findRenderCycle(component, componentRenderById, componentRerenderById, componentById) {
  if (component == null) {
    return null;
  } else if (componentRenderById.hasOwnProperty(component.id)) {
    return componentRenderById[component.id].cycle;
  } else if (componentRerenderById.hasOwnProperty(component.id)) {
    return componentRerenderById[component.id].cycle;
  } else if (component.ownerId != null) {
    if (componentById[component.ownerId] === component) {
      return null;
    }

    return findRenderCycle(componentById[component.ownerId], componentRenderById, componentRerenderById, componentById);
  } else {
    return null;
  }
}

onmessage = function (event) {
  let { visibility, window, lifeCycles, cycles, fitWidth = 300 } = JSON.parse(event.data);

  lifeCycles = marksToTimings(lifeCycles);
  lifeCycles = decodeContext(lifeCycles, { contextParser: 'qs' });
  lifeCycles = mergeContext(lifeCycles);

  cycles = marksToTimings(cycles);
  cycles = decodeContext(cycles, { contextParser: 'qs' });
  cycles = mergeContext(cycles);

  const componentById = _.keyBy(visibility, 'id');
  const componentRenderById = _.keyBy(_.filter(lifeCycles, event => event.type === 'render'), 'id');
  const componentRerenderById = _.keyBy(_.filter(lifeCycles, event => event.type === 'rerender'), 'id');
  const cyclesMap = _.keyBy(cycles, 'name');

  let maxBottom = 0;
  for (let component of visibility) {
    for (let element of component.elements) {
      const rect = element.rect;
      maxBottom = Math.max(rect.bottom, maxBottom);
    }
  }

  let minTop = 0;
  for (let component of visibility) {
    for (let element of component.elements) {
      const rect = element.rect;
      minTop = Math.min(rect.top, minTop);
    }
  }

  const ratio = fitWidth / window.innerWidth;
  const height = Math.max(maxBottom - minTop, window.innerHeight) * ratio;

  const viewport = {
    x: 0,
    y: -minTop * ratio,
    width: fitWidth,
    height: window.innerHeight * ratio
  };

  function findNonEmptyElementInParent(component, visited = new WeakSet(), hiddenComponentsPosition = {}) {
    const parent = componentById[component.ownerId];
    let rect;

    if (parent == null) {
      rect = { left: 0, right: 0, top: 0, bottom: 0 };
    } else if (visited.has(parent)) {
      rect = { left: 0, right: 0, top: 0, bottom: 0 };
    } else {
      visited.add(parent);

      const element = parent.elements[0];

      if (element == null) {
        rect = { left: 0, right: 0, top: 0, bottom: 0 };
      } else {
        rect = element.rect;

        if (rect.top === 0 && rect.right === 0 && rect.left === 0 && rect.bottom === 0) {
          return findNonEmptyElementInParent(parent, visited, hiddenComponentsPosition);
        }
      }
    }

    if (!hiddenComponentsPosition[parent.id]) {
      hiddenComponentsPosition[parent.id] = { x: 0, y: 0 };
    }

    const dim = 5 / ratio;
    const hiddenOffset = hiddenComponentsPosition[parent.id];

    hiddenOffset.x += dim;

    if (hiddenOffset.x / (fitWidth / ratio) > 1) {
      hiddenOffset.x = 0;
      hiddenOffset.y += dim;
    }

    return {
      left: rect.left + hiddenOffset.x,
      right: rect.left + hiddenOffset.x + dim,
      top: rect.top + hiddenOffset.y,
      bottom: rect.top + hiddenOffset.y + dim
    };
  }

  const renderCycles = {};
  const components = [];
  for (let component of visibility) {
    if (component.type === 'abstract') {
      continue;
    }

    let cycle = findRenderCycle(component, componentRenderById, componentRerenderById, componentById);

    if (cycle == null || !cyclesMap.hasOwnProperty(cycle)) {
      continue;
    }

    renderCycles[cycle] = true;

    for (let element of component.elements) {
      let rect = element.rect;
      let missing = false;

      if (isRectEmpty(rect)) {
        missing = true;
        rect = findNonEmptyElementInParent(component);
      }

      if (isRectEmpty(rect)) {
        // TODO assign every element a unique id internally for dom inspection
        continue;
      }

      components.push({
        x: rect.left * ratio + 1,
        y: (rect.top - minTop) * ratio + 1,
        width: Math.max((rect.right - rect.left) * ratio - 2, 0),
        height: Math.max(((rect.bottom - minTop) - (rect.top - minTop)) * ratio - 2, 0),
        visibilityMode: missing ? 'missing' : element.visible > 0 ? 'visible' : 'hidden',
        visible: element.visible,
        cycle,
        name: component.name,
        id: component.id,
        ownerName: component.ownerName,
        ownerId: component.ownerId,
      });
    }
  }

  const isPageLoad = Object.keys(renderCycles).length && cyclesMap.hasOwnProperty(0);
  const minCycle = _.minBy(cycles, cycle => cycle.end);
  const maxCycle = _.maxBy(cycles, cycle => cycle.start);

  postMessage(JSON.stringify({
    viewport,
    computedWidth: fitWidth,
    computedHeight: height,
    components,
    isPageLoad,
    minCycle,
    maxCycle,
    cycles: cyclesMap
  }));
};