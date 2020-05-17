'use strict';

System.register(['lodash', 'jquery', 'jquery.flot', 'jquery.flot.pie', './node_modules/@svgdotjs/svg.js/dist/svg.min.js'], function (_export, _context) {
  "use strict";

  var _, $, SVG, SVGextend, SVGElement, SVGDom, SVGGet;

  function link(scope, elem, attrs, ctrl) {
    var panel;
    var svgelem = elem[0].getElementsByClassName('svg-object')[0];
    elem = elem.find('.svg-panel');
    var plotCanvas = elem.find('.plot-canvas');
    var svgnode;

    ctrl.events.on('render', function () {
      render();
      ctrl.renderingCompleted();
    });

    function setElementHeight() {
      try {
        var height = ctrl.height || panel.height || ctrl.row.height;
        if (_.isString(height)) {
          height = parseInt(height.replace('px', ''), 10);
        }

        height -= 5; // padding
        height -= panel.title ? 24 : 9; // subtract panel title bar

        elem.css('height', height + 'px');

        return true;
      } catch (e) {
        // IE throws errors sometimes
        return false;
      }
    }
    //////// SVG.js Extensions
    // console.log("beginning SVG.js Extensions");
    SVGextend(SVGElement, {
      animateContRotate: function animateContRotate(speed) {
        this.animate(1000).ease('-').rotate(360).loop();
      }
    });
    SVGextend(SVGDom, {
      updateXHTMLFontText: function updateXHTMLFontText(newText) {
        var currentElement = this.node;
        while (currentElement.localName !== "xhtml:font") {
          currentElement = currentElement.firstElementChild;
        }
        currentElement.innerHTML = newText;
      }
    });
    // console.log("ending SVG.js Extensions");

    function formatter(label, slice) {
      return "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>" + Math.round(slice.percent) + "%</div>";
    }

    function addSVG() {
      ctrl.parentSVG = SVG(svgnode);
      ctrl.parentSVG.clear();

      ctrl.parentSVG.svg(panel.svg_data);
      // parentSVG.node.append(childSVG.node);
    }

    function resizePlotCanvas() {
      var plotCss = {
        top: '10px',
        margin: 'auto',
        position: 'relative',
        height: elem.height() + 'px'
      };
      plotCanvas.css(plotCss);
    }

    function initializeMappings(svgnode) {
      ctrl.svgElements = {};
      for (var i = 0; i < ctrl.panel.svgIdMappings.length; i++) {
        if (ctrl.panel.svgIdMappings[i].mappedName !== '') {
          // console.log(ctrl.parentSVG);
          ctrl.svgElements[ctrl.panel.svgIdMappings[i].mappedName] = ctrl.parentSVG.findOne('#' + ctrl.panel.svgIdMappings[i].svgId);
        }
      }
      // console.log(ctrl.svgElements);
    }
    function render() {
      panel = ctrl.panel;

      if (setElementHeight()) {
        if (svgelem) {
          svgnode = svgelem;

          if (svgnode.getAttribute("name") == 'isInitial') {
            svgnode.removeAttribute("name");
            ctrl.initialized = 0;
          }

          resizePlotCanvas();

          if (!ctrl.initialized) {
            addSVG();
            initializeMappings(svgnode);
            panel.doInit(ctrl, svgnode);
            ctrl.initialized = 1;
          }

          panel.handleMetric(ctrl, svgnode);

          svgnode = null;
        } else {
          ctrl.initialized = 0;
        }
      }
    }
  }

  _export('default', link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotPie) {}, function (_node_modulesSvgdotjsSvgJsDistSvgMinJs) {
      SVG = _node_modulesSvgdotjsSvgJsDistSvgMinJs.SVG;
      SVGextend = _node_modulesSvgdotjsSvgJsDistSvgMinJs.extend;
      SVGElement = _node_modulesSvgdotjsSvgJsDistSvgMinJs.Element;
      SVGDom = _node_modulesSvgdotjsSvgJsDistSvgMinJs.Dom;
      SVGGet = _node_modulesSvgdotjsSvgJsDistSvgMinJs.get;
    }],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
