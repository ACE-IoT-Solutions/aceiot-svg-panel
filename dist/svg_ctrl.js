'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series', './rendering', './demos', 'node_modules/snapsvg/dist/snap.svg-min.js'], function(_export, _context) {
    "use strict";

    var MetricsPanelCtrl, _, kbn, TimeSeries, rendering, SVGDemos, Snap, _createClass, SVGCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function(_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function(_lodash) {
            _ = _lodash.default;
        }, function(_appCoreUtilsKbn) {
            kbn = _appCoreUtilsKbn.default;
        }, function(_appCoreTime_series) {
            TimeSeries = _appCoreTime_series.default;
        }, function(_rendering) {
            rendering = _rendering.default;
        }, function(_demos) {
            SVGDemos = _demos.SVGDemos;
        }, function(_node_modulesSnapsvgDistSnapSvgMinJs) {
            Snap = _node_modulesSnapsvgDistSnapSvgMinJs.Snap;
        }],
        execute: function() {
            _createClass = function() {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function(Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('SVGCtrl', SVGCtrl = function(_MetricsPanelCtrl) {
                _inherits(SVGCtrl, _MetricsPanelCtrl);

                function SVGCtrl($scope, $injector, $rootScope) {
                    _classCallCheck(this, SVGCtrl);

                    var _this = _possibleConstructorReturn(this, (SVGCtrl.__proto__ || Object.getPrototypeOf(SVGCtrl)).call(this, $scope, $injector));

                    _this.$rootScope = $rootScope;

                    var panelDefaults = {
                        links: [],
                        datasource: null,
                        maxDataPoints: 3,
                        interval: null,
                        targets: [{}],
                        cacheTimeout: null,
                        nullPointMode: 'connected',
                        aliasColors: {},
                        format: 'short',

                        svg_data: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000" ></svg>',
                        js_code: '',
                        js_init_code: ''
                    };

                    _.defaults(_this.panel, panelDefaults);

                    _this.events.on('render', _this.onRender.bind(_this));
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('data-error', _this.onDataError.bind(_this));
                    _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));

                    _this.demos = new SVGDemos(_this);
                    _this.initialized = 0;
                    return _this;
                }

                _createClass(SVGCtrl, [{
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('Options', 'public/plugins/grafana-svg-panel/editor.html', 2);
                        this.unitFormats = kbn.getUnitFormats();
                    }
                }, {
                    key: 'setUnitFormat',
                    value: function setUnitFormat(subItem) {
                        this.panel.format = subItem.value;
                        this.render();
                    }
                }, {
                    key: 'onDataError',
                    value: function onDataError() {
                        this.series = [];
                        this.render();
                    }
                }, {
                    key: 'changeSeriesColor',
                    value: function changeSeriesColor(series, color) {
                        series.color = color;
                        this.panel.aliasColors[series.alias] = series.color;
                        this.render();
                    }
                }, {
                    key: 'setHandleMetricFunction',
                    value: function setHandleMetricFunction() {
                        this.panel.handleMetric = Function('ctrl', 'svgnode', this.panel.js_code);
                    }
                }, {
                    key: 'setInitFunction',
                    value: function setInitFunction() {
                        this.initialized = 0;
                        this.panel.doInit = Function('ctrl', 'svgnode', this.panel.js_init_code);
                    }
                }, {
                    key: 'onRender',
                    value: function onRender() {
                        if (!this.panel.handleMetric) {
                            this.setHandleMetricFunction();
                        }

                        if (!this.panel.doInit) {
                            this.setInitFunction();
                        }
                    }
                }, {
                    key: 'onDataReceived',
                    value: function onDataReceived(dataList) {
                        this.series = dataList.map(this.seriesHandler.bind(this));
                        this.render();
                    }
                }, {
                    key: 'resetSVG',
                    value: function resetSVG() {
                        this.initialized = 0;
                    }
                }, {
                    key: 'seriesHandler',
                    value: function seriesHandler(seriesData) {
                        var series = new TimeSeries({
                            datapoints: seriesData.datapoints,
                            alias: seriesData.target
                        });

                        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
                        return series;
                    }
                }, {
                    key: 'getSeriesIdByAlias',
                    value: function getSeriesIdByAlias(aliasName) {
                        for (var i = 0; i < this.series.length; i++) {
                            if (this.series[i].alias == aliasName) {
                                return i;
                            }
                        }
                        return -1;
                    }
                }, {
                    key: 'getSeriesElementByAlias',
                    value: function getSeriesElementByAlias(aliasName) {
                        var i = this.getSeriesIdByAlias(aliasName);
                        if (i >= 0) {
                            return this.series[i];
                        }
                        return null;
                    }
                }, {
                    key: 'getDecimalsForValue',
                    value: function getDecimalsForValue(value) {
                        if (_.isNumber(this.panel.decimals)) {
                            return { decimals: this.panel.decimals, scaledDecimals: null };
                        }

                        var delta = value / 2;
                        var dec = -Math.floor(Math.log(delta) / Math.LN10);

                        var magn = Math.pow(10, -dec);
                        var norm = delta / magn; // norm is between 1.0 and 10.0
                        var size;

                        if (norm < 1.5) {
                            size = 1;
                        } else if (norm < 3) {
                            size = 2;
                            // special case for 2.5, requires an extra decimal
                            if (norm > 2.25) {
                                size = 2.5;
                                ++dec;
                            }
                        } else if (norm < 7.5) {
                            size = 5;
                        } else {
                            size = 10;
                        }

                        size *= magn;

                        // reduce starting decimals if not needed
                        if (Math.floor(value) === value) {
                            dec = 0;
                        }

                        var result = {};
                        result.decimals = Math.max(0, dec);
                        result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

                        return result;
                    }
                }, {
                    key: 'formatValue',
                    value: function formatValue(value) {
                        var decimalInfo = this.getDecimalsForValue(value);
                        var formatFunc = kbn.valueFormats[this.panel.format];
                        if (formatFunc) {
                            return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
                        }
                        return value;
                    }
                }, {
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        rendering(scope, elem, attrs, ctrl);
                    }
                }]);

                return SVGCtrl;
            }(MetricsPanelCtrl));

            _export('SVGCtrl', SVGCtrl);

            SVGCtrl.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=svg_ctrl.js.map