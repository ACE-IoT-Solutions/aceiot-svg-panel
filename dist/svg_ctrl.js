'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series', './rendering', './node_modules/brace/index.js', './node_modules/brace/ext/language_tools.js', './node_modules/brace/theme/tomorrow_night_bright.js', './node_modules/brace/mode/javascript.js', './node_modules/brace/mode/svg.js', '@grafana/data'], function (_export, _context) {
    "use strict";

    var MetricsPanelCtrl, _, kbn, TimeSeries, rendering, ace, DataFrame, PanelEvents, _typeof, _createClass, GrafanaJSCompleter, SVGCtrl;

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

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_appCoreUtilsKbn) {
            kbn = _appCoreUtilsKbn.default;
        }, function (_appCoreTime_series) {
            TimeSeries = _appCoreTime_series.default;
        }, function (_rendering) {
            rendering = _rendering.default;
        }, function (_node_modulesBraceIndexJs) {
            ace = _node_modulesBraceIndexJs.default;
        }, function (_node_modulesBraceExtLanguage_toolsJs) {}, function (_node_modulesBraceThemeTomorrow_night_brightJs) {}, function (_node_modulesBraceModeJavascriptJs) {}, function (_node_modulesBraceModeSvgJs) {}, function (_grafanaData) {
            DataFrame = _grafanaData.DataFrame;
            PanelEvents = _grafanaData.PanelEvents;
        }],
        execute: function () {
            _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
                return typeof obj;
            } : function (obj) {
                return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };

            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            GrafanaJSCompleter = function () {
                function GrafanaJSCompleter($lang_tools, $control, $panel) {
                    _classCallCheck(this, GrafanaJSCompleter);

                    this.$lang_tools = $lang_tools;
                    this.$control = $control;
                    this.$panel = $panel;
                }

                _createClass(GrafanaJSCompleter, [{
                    key: 'getCompletions',
                    value: function getCompletions(editor, session, pos, prefix, callback) {
                        try {
                            var pos = editor.getCursorPosition();
                            var line = editor.session.getLine(pos.row);

                            prefix = line.substring(0, pos.column).match(/this\.\S*/g);
                            if (prefix) {
                                prefix = prefix[prefix.length - 1];
                                prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                                var panelthis = this.$panel;
                                var evalObj = eval('panel' + prefix);
                                this.evaluatePrefix(evalObj, callback);
                                return;
                            }

                            prefix = line.substring(0, pos.column).match(/ctrl\.\S*/g);
                            if (prefix) {
                                prefix = prefix[prefix.length - 1];
                                prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                                var ctrl = this.$control;
                                var evalObj = eval(prefix);
                                this.evaluatePrefix(evalObj, callback);
                                return;
                            }

                            prefix = line.substring(0, pos.column).match(/svgnode\.\S*/g);
                            if (prefix) {
                                prefix = prefix[prefix.length - 1];
                                prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                                var svgnode = this.$control.parentSVG.node;
                                var evalObj = eval(prefix);
                                this.evaluatePrefix(evalObj, callback);
                                return;
                            }

                            prefix = line.substring(0, pos.column).match(/svgmap\.\S*/g);
                            if (prefix) {
                                prefix = prefix[prefix.length - 1];
                                prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                                var svgmap = this.$control.svgElements;
                                var evalObj = eval(prefix);
                                this.evaluatePrefix(evalObj, callback);
                                return;
                            }
                            if (prefix == '') {
                                var wordList = ['ctrl', 'svgnode', 'svgmap', 'this'];

                                callback(null, wordList.map(function (word) {
                                    return {
                                        caption: word,
                                        value: word,
                                        meta: 'Grafana keyword'
                                    };
                                }));
                            }
                        } catch (e) {
                            console.error("Autocompleter encountered an error");
                            console.error(e);
                            callback(null, []);
                        }
                    }
                }, {
                    key: 'evaluatePrefix',
                    value: function evaluatePrefix(evalObj, callback) {
                        var wordList = [];
                        for (var key in evalObj) {
                            wordList.push(key);
                        }
                        callback(null, wordList.map(function (word) {
                            return {
                                caption: word + ': ' + (Array.isArray(evalObj[word]) ? 'Array[' + (evalObj[word] || []).length + ']' : _typeof(evalObj[word])),
                                value: word,
                                meta: "Grafana keyword"
                            };
                        }));
                        return;
                    }
                }]);

                return GrafanaJSCompleter;
            }();

            _export('SVGCtrl', SVGCtrl = function (_MetricsPanelCtrl) {
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
                        js_init_code: '',
                        clickMapperEnabled: false,
                        svgIdMappings: [],
                        svgElements: {},
                        editorCompletion: true,
                        svgBuilderData: {
                            width: '100%',
                            height: '100%',
                            viewport: {
                                x: 0,
                                y: 0,
                                width: 1000,
                                height: 1000
                            },
                            elements: []
                        }
                    };

                    _.defaults(_this.panel, panelDefaults);
                    _this.dataFormat = 'series';

                    _this.events.on(PanelEvents.render, _this.onRender.bind(_this));
                    _this.events.on(PanelEvents.refresh, _this.onRender.bind(_this));
                    _this.events.on(PanelEvents.dataReceived, _this.onDataReceived.bind(_this));
                    _this.events.on(PanelEvents.dataError, _this.onDataError.bind(_this));
                    _this.events.on(PanelEvents.dataSnapshotLoad, _this.onDataReceived.bind(_this));
                    _this.events.on(PanelEvents.editModeInitialized, _this.onInitEditMode.bind(_this));

                    _this.initialized = 0;
                    _this.editors = {};

                    return _this;
                }

                _createClass(SVGCtrl, [{
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('SVG', 'public/plugins/aceiot-svg-panel/editor_svg.html', 3);
                        this.addEditorTab('Events', 'public/plugins/aceiot-svg-panel/editor_events.html', 4);
                        this.addEditorTab('SVG ID Mapper', 'public/plugins/aceiot-svg-panel/editor_mapper.html', 5);
                        this.unitFormats = kbn.getUnitFormats();
                        this.aceLangTools = ace.acequire("ace/ext/language_tools");
                        this.aceLangTools.addCompleter(new GrafanaJSCompleter(this.aceLangTools, this, this.panel));
                    }
                }, {
                    key: 'doShowAceJs',
                    value: function doShowAceJs(nodeId) {
                        setTimeout(function () {
                            if ($('#' + nodeId).length === 1) {
                                this.editors[nodeId] = ace.edit(nodeId);
                                $('#' + nodeId).attr('id', nodeId + '_initialized');
                                this.editors[nodeId].setValue(this.panel[nodeId], 1);
                                this.editors[nodeId].getSession().on('change', function () {
                                    var val = this.editors[nodeId].getSession().getValue();
                                    this.panel[nodeId] = val;
                                    try {
                                        this.setInitFunction();
                                        this.setHandleMetricFunction();
                                        this.render();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }.bind(this));
                                this.editors[nodeId].setOptions({
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: this.panel.editorCompletion,
                                    theme: 'ace/theme/tomorrow_night_bright',
                                    mode: 'ace/mode/javascript',
                                    showPrintMargin: false
                                });
                            }
                        }.bind(this), 100);
                        return true;
                    }
                }, {
                    key: 'doShowAceSvg',
                    value: function doShowAceSvg(nodeId) {
                        setTimeout(function () {
                            if ($('#' + nodeId).length === 1) {
                                this.editors[nodeId] = ace.edit(nodeId);
                                $('#' + nodeId).attr('id', nodeId + '_initialized');
                                this.editors[nodeId].setValue(this.panel[nodeId], 1);
                                this.editors[nodeId].getSession().on('change', function () {
                                    var val = this.editors[nodeId].getSession().getValue();
                                    this.panel[nodeId] = val;
                                    try {
                                        this.resetSVG();
                                        this.render();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }.bind(this));
                                this.editors[nodeId].setOptions({
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: this.panel.editorCompletion,
                                    readOnly: this.panel.useSVGBuilder,
                                    theme: 'ace/theme/tomorrow_night_bright',
                                    mode: 'ace/mode/svg',
                                    showPrintMargin: false
                                });
                            }
                        }.bind(this), 100);
                        return true;
                    }
                }, {
                    key: 'removeSvgIdMapping',
                    value: function removeSvgIdMapping(svgIdMapping) {
                        for (var i = 0; i < this.panel.svgIdMappings.length; i++) {
                            if (svgIdMapping.svgId === this.panel.svgIdMappings[i].svgId) {
                                this.panel.svgIdMappings.splice(i, 1);
                                this.updateMappings();
                            }
                        }
                    }
                }, {
                    key: 'svgClickHandler',
                    value: function svgClickHandler(event) {
                        if (this.panel.clickMapperEnabled) {
                            var clicked = event.target;
                            while (clicked.id === '') {
                                clicked = clicked.parentNode;
                            }
                            for (var i = 0; i < this.panel.svgIdMappings.length; i++) {
                                if (this.panel.svgIdMappings[i].svgId === clicked.id) {
                                    return;
                                }
                            }
                            this.panel.svgIdMappings.push({ 'svgId': clicked.id, 'mappedName': '' });
                            this.$rootScope.$apply();
                        }
                    }
                }, {
                    key: 'addManualSvgIdMapping',
                    value: function addManualSvgIdMapping(svgIdMapping) {
                        this.panel.svgIdMappings.push(svgIdMapping);
                    }
                }, {
                    key: 'uploadSVG',
                    value: function uploadSVG(event) {
                        var target = event.currentTarget;
                        var file = target.files[0];
                        var reader = new FileReader();
                        if (target.files && file) {
                            reader.onload = function (event) {
                                this.panel.svg_data = event.target.result;
                                this.resetSVG();
                            };
                        }
                    }
                }, {
                    key: 'updateClickMapper',
                    value: function updateClickMapper() {
                        // console.log(this.panel.clickMapperEnabled);
                        if (this.panel.clickMapperEnabled) {
                            // document.getElementsByClassName('svg-object')[0].addEventListener('click', this.svgClickHandler.bind(this), false);
                            document.getElementsByClassName('svg-object')[0].onclick = this.svgClickHandler.bind(this);
                        } else {
                            // document.getElementsByClassName('svg-object')[0].removeEventListener('click', this.svgClickHandler.bind(this), false);
                            document.getElementsByClassName('svg-object')[0].onclick = null;
                        }
                    }
                }, {
                    key: 'updateMappings',
                    value: function updateMappings() {
                        this.resetSVG();
                        this.render();
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
                        this.data = [];
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
                    key: 'doInit',
                    value: function doInit(ctrl, svgnode) {
                        try {
                            ctrl.panel.doInitUserFunction(ctrl, svgnode, ctrl.svgElements);
                        } catch (error) {
                            console.error('Failed to run provided user init code, check code for errors and try again. Error: ' + error);
                        }
                    }
                }, {
                    key: 'handleMetric',
                    value: function handleMetric(ctrl, svgnode) {
                        try {
                            ctrl.panel.handleMetricUserFunction(ctrl, svgnode, ctrl.svgElements);
                        } catch (error) {
                            console.error('Failed to run provided user event code, check code for errors and try again. Error: ' + error);
                        }
                    }
                }, {
                    key: 'setHandleMetricFunction',
                    value: function setHandleMetricFunction() {
                        this.panel.handleMetricUserFunction = Function('ctrl', 'svgnode', 'svgmap', this.panel.js_code);
                        this.panel.handleMetric = this.handleMetric;
                    }
                }, {
                    key: 'setInitFunction',
                    value: function setInitFunction() {
                        this.initialized = 0;
                        this.panel.doInitUserFunction = Function('ctrl', 'svgnode', 'svgmap', this.panel.js_init_code);
                        this.panel.doInit = this.doInit;
                    }
                }, {
                    key: 'onRender',
                    value: function onRender() {
                        if (!_.isFunction(this.panel.handleMetric)) {
                            this.setHandleMetricFunction();
                        }

                        if (!_.isFunction(this.panel.doInit)) {
                            this.setInitFunction();
                        }
                    }
                }, {
                    key: 'handleDataFrame',
                    value: function handleDataFrame(data) {
                        this.dataFrame = data;
                    }
                }, {
                    key: 'onDataReceived',
                    value: function onDataReceived(dataList) {
                        this.data = [];

                        if (dataList.length > 0 && dataList[0].type === 'table') {
                            this.data = dataList.map(this.tableHandler.bind(this));
                            this.table = this.data; // table should be regarded as deprecated
                        } else if (dataList.length > 0 && dataList[0].type === 'docs') {
                            this.data = dataList.map(this.docsHandler.bind(this));
                        } else {
                            this.data = dataList.map(this.seriesHandler.bind(this));
                            this.series = this.data; // series should be regarded as deprectated
                        }

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
                    key: 'docsHandler',
                    value: function docsHandler(seriesData) {
                        return seriesData;
                    }
                }, {
                    key: 'tableHandler',
                    value: function tableHandler(tableData) {

                        var columnNames = tableData.columns.map(function (column) {
                            return column.text;
                        });

                        var rows = tableData.rows.map(function (row) {
                            var datapoint = {};

                            row.forEach(function (value, columnIndex) {
                                var key = columnNames[columnIndex];
                                datapoint[key] = value;
                            });

                            return datapoint;
                        });

                        return { columnNames: columnNames, rows: rows };
                    }
                }, {
                    key: 'getSeriesIdByAlias',
                    value: function getSeriesIdByAlias(aliasName) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].alias == aliasName) {
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
                            return this.data[i];
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
                    key: 'formatValueWithFormatter',
                    value: function formatValueWithFormatter(value, formatter) {
                        var decimalInfo = this.getDecimalsForValue(value);
                        var formatFunc = kbn.valueFormats[formatter];
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
