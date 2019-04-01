
/*!
* Ported from jQuery Nearest plugin v1.4.0 (2011-2015 Gilmore Davidson under the MIT licence)
*   http://gilmoreorless.github.io/jquery-nearest/LICENSE.txt
*
* Ported to pure ES6 by: Jorge Duarte Rodriguez <info@malagadev.com>
* August 2018
*/

const rPerc = /^([\d.]+)%$/

class NearestError extends Error {
  constructor (typeString, message) {
    super(message)
    this.stack = (new Error()).stack
    this.typeString = typeString
    this.message = message
  }
}

export default class Nearest {
  constructor (point, selector, container) {
    if (!point || point.x === undefined || point.y === undefined) {
      throw new NearestError('INVALID_POINT', 'Invalid point')
    }

    this.defaults = {
      x: 0, // X position of top left corner of point/region
      y: 0, // Y position of top left corner of point/region
      w: 0, // Width of region
      h: 0, // Height of region
      tolerance: 1, // Distance tolerance in pixels, mainly to handle fractional pixel rounding bugs
      container: document, // Container of objects for calculating %-based dimensions
      furthest: false, // Find max distance (true) or min distance (false)
      includeSelf: false, // Include 'this' in search results (t/f) - only applies to $(elem).func(selector) syntax
      sameX: false, // name === 'touching' Only match for the same X axis values (t/f)
      sameY: false, // Only match for the same Y axis values (t/f)
      onlyX: false, // Only check X axis variations (t/f)
      onlyY: false, // Only check Y axis variations (t/f),
      directionConstraints: [], // Array of directions to limit search: 'left', 'right' ,'top', 'bottom'
      sort: false // Sort results based on distance: 'nearest', 'furthest'
    }

    let options = Object.assign({}, this.defaults, point, {})

    // Normalise selector, dimensions and constraints
    selector || (selector = 'div') // I STRONGLY recommend passing in a selector
    let containerOffset = { left: container.offsetLeft, top: container.offsetTop }
    let containerWH = [
      //container.width() || 0,
      container.clientWidth || 0,
      container.clientHeight || 0,
      //container.height() || 0
    ]
    let containerProps = {
      // prop: [min, max]
      x: [containerOffset.left, containerOffset.left + containerWH[0]],
      y: [containerOffset.top, containerOffset.top + containerWH[1]],
      w: [0, containerWH[0]],
      h: [0, containerWH[1]]
    }
    let directionConstraints = options.directionConstraints
    let prop, dims, match

    console.log('containerWH: ', containerWH, container)

    for (prop in containerProps) {
      if (containerProps.hasOwnProperty(prop)) {
        match = rPerc.exec(options[prop])
        if (match) {
          dims = containerProps[prop]
          options[prop] = (dims[1] - dims[0]) * match[1] / 100 + dims[0]
        }
      }
    }

    if (typeof directionConstraints !== 'object' || directionConstraints.isArray() === false) {
      directionConstraints = (typeof directionConstraints === 'string') ? [directionConstraints] : []
    }

    // Deprecated options - remove in 2.0
    if (options.sameX === false && options.checkHoriz === false) {
      options.sameX = !options.checkHoriz
    }
    if (options.sameY === false && options.checkVert === false) {
      options.sameY = !options.checkVert
    }

    console.log('FIND ', selector, ' in CONTAINER (INIT CACHE)')

    // Get elements and work out x/y points
    let all = container.querySelectorAll(selector)
    let cache = []
    let furthest = !!options.furthest
    let checkX = !options.sameX
    let checkY = !options.sameY
    let onlyX = !!options.onlyX
    let onlyY = !!options.onlyY
    let compDist = furthest ? 0 : Infinity
    let point1x = parseFloat(options.x) || 0
    let point1y = parseFloat(options.y) || 0
    let point2x = parseFloat(point1x + options.w) || point1x
    let point2y = parseFloat(point1y + options.h) || point1y
    let box = {
      x1: point1x,
      y1: point1y,
      x2: point2x,
      y2: point2y
    }
    let tolerance = parseFloat(options.tolerance) || 0

    // Shortcuts to help with compression
    let min = Math.min
    let max = Math.max

    // Normalise the remaining options
    if (tolerance < 0) {
      tolerance = 0
    }
    console.log('FIND: ', all)
    // Loop through all elements and check their positions
    // all[hasEach2 ? 'each2' : 'each'](function (i, elem) {
    all.forEach((elem, i) => {
      // let $this = elem
      let off = { left: elem.offsetLeft, top: elem.offsetTop } // $this.offset(),
      let x = off.left
      let y = off.top
      let w = elem.clientWidth //$this.outerWidth(),
      let h = elem.clientHeight //$this.outerHeight(),
      let x2 = x + w
      let y2 = y + h
      let maxX1 = max(x, point1x)
      let minX2 = min(x2, point2x)
      let maxY1 = max(y, point1y)
      let minY2 = min(y2, point2y)
      let thisBox = {
        x1: x,
        y1: y,
        x2: x2,
        y2: y2
      }
      let intersectX = minX2 >= maxX1
      let intersectY = minY2 >= maxY1
      let distX
      let distY
      let distT
      // let isValid


      /*
      console.log('let inicial: ', {
      elem: $this,
      x: x,
      y: y,
      w: w,
      h: h,
      point1x: point1x,
      point1y: point1y
    })
    */
    if (
      // .nearest() / .furthest()
      (checkX && checkY) ||
      // .touching()
      (!checkX && !checkY && intersectX && intersectY) ||
      // .nearest({sameY: true})
      (checkX && intersectY) ||
      // .nearest({sameX: true})
      (checkY && intersectX) ||
      // .nearest({onlyX: true})
      (checkX && onlyX) ||
      // .nearest({onlyY: true})
      (checkY && onlyY)
    ) {
      //opc1 5650 NaN 496 NaN
      //      console.log('opc1', maxX1, minX2, maxY1, minY2)
      distX = intersectX ? 0 : maxX1 - minX2;
      distY = intersectY ? 0 : maxY1 - minY2;
      if (onlyX || onlyY) {
        //          console.log('opc1a')
        distT = onlyX ? distX : distY;
      } else {
        //      console.log('opc1b', intersectX, intersectY, distX, distY)
        distT = intersectX || intersectY ?
        max(distX, distY) :
        Math.sqrt(distX * distX + distY * distY);
      }

      //    console.log('compDist[',compDist,'-',distT,']: ',min(compDist, distT), 'tolerance:', tolerance)

      let isValid = furthest ?
      distT >= compDist - tolerance :
      distT <= compDist + tolerance;
      if (!this.checkDirectionConstraints(box, thisBox, directionConstraints)) {
        isValid = false;
      }

      if (isValid) {
        
        console.log('GANADOR: ', elem)
        compDist = furthest ?
        max(compDist, distT) :
        min(compDist, distT);
        cache.push({
          node: elem,
          dist: distT
        });
      } else {
        //  console.log('No hay gnador ')
      }
    }
  });
  console.log('CACHE IS: ',cache)
  //	if (options.sort === 'nearest') {
  cache.sort(function(a,b) { return a.dist - b.dist; });
  /*	} else if (options.sort === 'furthest') {
  cache.sort(function(a,b) { return b.dist - a.dist; });
}
*/
// Make sure all cached items are within tolerance range
let len = cache.length,
filtered = [],
compMin, compMax,
i, item;
if (len) {
  if (furthest) {
    compMin = compDist - tolerance
    compMax = compDist
  } else {
    compMin = compDist
    compMax = compDist + tolerance
  }
  for (i = 0; i < len; i++) {
    item = cache[i];
    if (item.dist >= compMin && item.dist <= compMax) {
      filtered.push(item.node)
    }
  }
}
console.log('Filtered is: ', filtered)
if (filtered.length > 0) {
  //  alert('ganador: '+filtered[0].innerHTML)
}
return filtered
}

checkDirectionConstraints(refBox, itemBox, constraints) {
  let results = {
    left:   refBox.x1 > itemBox.x1,
    right:  refBox.x2 < itemBox.x2,
    top:    refBox.y1 > itemBox.y1,
    bottom: refBox.y2 < itemBox.y2
  }

  return constraints.reduce(function(result, direction) {
    return result && !!results[direction];
  }, true)
}
/*
$.each(['nearest', 'furthest', 'touching'], function (i, name) {

// Internal default options
// Not exposed publicly because they're method-dependent and easily overwritten anyway
let defaults = {
x: 0, // X position of top left corner of point/region
y: 0, // Y position of top left corner of point/region
w: 0, // Width of region
h: 0, // Height of region
tolerance:   1, // Distance tolerance in pixels, mainly to handle fractional pixel rounding bugs
container:   document, // Container of objects for calculating %-based dimensions
furthest:    name == 'furthest', // Find max distance (true) or min distance (false)
includeSelf: false, // Include 'this' in search results (t/f) - only applies to $(elem).func(selector) syntax
sameX: name === 'touching', // Only match for the same X axis values (t/f)
sameY: name === 'touching', // Only match for the same Y axis values (t/f)
onlyX: false, // Only check X axis variations (t/f)
onlyY: false, // Only check Y axis variations (t/f),
directionConstraints: [], // Array of directions to limit search: 'left', 'right' ,'top', 'bottom'
sort: false // Sort results based on distance: 'nearest', 'furthest'
};
*/
/**
* $.nearest() / $.furthest() / $.touching()
*
* Utility functions for finding elements near a specific point or region on screen
*
* @param hash point Co-ordinates for the point or region to measure from
*                   "x" and "y" keys are required, "w" and "h" keys are optional
* @param mixed selector Any valid jQuery selector that provides elements to filter
* @param hash options (optional) Extra filtering options
*                     Not technically needed as the options could go on the point object,
*                     but it's good to have a consistent API
* @return jQuery object containing matching elements in selector
*/
/*	$[name] = function (point, selector, options) {
if (!point || point.x === undefined || point.y === undefined) {
return $([]);
}
let opts = $.extend({}, defaults, point, options || {});
return $(nearest(selector, opts));
};*/

/**
* SIGNATURE 1:
*   $(elem).nearest(selector) / $(elem).furthest(selector) / $(elem).touching(selector)
*
*   Finds all elements in selector that are nearest to/furthest from elem
*
*   @param mixed selector Any valid jQuery selector that provides elements to filter
*   @param hash options (optional) Extra filtering options
*   @return jQuery object containing matching elements in selector
*
* SIGNATURE 2:
*   $(elemSet).nearest(point) / $(elemSet).furthest(point) / $(elemSet).touching(point)
*
*   Filters elemSet to return only the elements nearest to/furthest from point
*   Effectively a wrapper for $.nearest(point, elemSet) but with the benefits of method chaining
*
*   @param hash point Co-ordinates for the point or region to measure from
*   @return jQuery object containing matching elements in elemSet
*/
/*		$.fn[name] = function (selector, options) {
if (!this.length) {
return this.pushStack([]);
}
let opts;
if (selector && $.isPlainObject(selector)) {
opts = $.extend({}, defaults, selector, options || {});
return this.pushStack(nearest(this, opts));
}
let offset = this.offset(),
dimensions = {
x: offset.left,
y: offset.top,
w: this.outerWidth(),
h: this.outerHeight()
};
opts = $.extend({}, defaults, dimensions, options || {});
return this.pushStack(nearest(selector, opts, this));
};
});
*/
}
