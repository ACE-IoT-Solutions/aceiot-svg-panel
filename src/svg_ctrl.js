import { MetricsPanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import rendering from './rendering';
import ace from './node_modules/brace/index.js';
import './node_modules/brace/ext/language_tools.js';
import './node_modules/brace/theme/tomorrow_night_bright.js';
import './node_modules/brace/mode/javascript.js';
import './node_modules/brace/mode/svg.js';
import { DataFrame, PanelEvents } from '@grafana/data';


class GrafanaJSCompleter {
    constructor($lang_tools, $control, $panel) {
        this.$lang_tools = $lang_tools;
        this.$control = $control;
        this.$panel = $panel;
    }

    getCompletions(editor, session, pos, prefix, callback) {
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

                var svgnode = this.$control.parentSVG.node
                var evalObj = eval(prefix);
                this.evaluatePrefix(evalObj, callback);
                return;
            }

            prefix = line.substring(0, pos.column).match(/svgmap\.\S*/g);
            if (prefix) {
                prefix = prefix[prefix.length - 1];
                prefix = prefix.substring(0, prefix.lastIndexOf('.'));

                var svgmap = this.$control.svgElements
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
            console.error("Autocompleter encountered an error")
            console.error(e)
            callback(null, [])
        }
    }

    evaluatePrefix(evalObj, callback) {
        var wordList = [];
        for (var key in evalObj) {
            wordList.push(key);
        }
        callback(null, wordList.map(function (word) {
            return {
                caption: word + ': ' + (Array.isArray(evalObj[word]) ? 'Array[' + (evalObj[word] || []).length + ']' : typeof evalObj[word]),
                value: word,
                meta: "Grafana keyword"
            };
        }));
        return;
    }
}


export class SVGCtrl extends MetricsPanelCtrl {

    constructor($scope, $injector, $rootScope) {
        super($scope, $injector);
        this.$rootScope = $rootScope;

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

        _.defaults(this.panel, panelDefaults);
        this.dataFormat = 'series';

        this.events.on(PanelEvents.render, this.onRender.bind(this));
        this.events.on(PanelEvents.refresh, this.onRender.bind(this));
        this.events.on(PanelEvents.dataReceived, this.onDataReceived.bind(this));
        this.events.on(PanelEvents.dataError, this.onDataError.bind(this));
        this.events.on(PanelEvents.dataSnapshotLoad, this.onDataReceived.bind(this));
        this.events.on(PanelEvents.editModeInitialized, this.onInitEditMode.bind(this));

        this.initialized = 0;
        this.editors = {};

    }

    onInitEditMode() {
        this.addEditorTab('SVG', 'public/plugins/aceiot-svg-panel/editor_svg.html', 3);
        this.addEditorTab('Events', 'public/plugins/aceiot-svg-panel/editor_events.html', 4);
        this.addEditorTab('SVG ID Mapper', 'public/plugins/aceiot-svg-panel/editor_mapper.html', 5);
        this.unitFormats = kbn.getUnitFormats();
        this.aceLangTools = ace.acequire("ace/ext/language_tools");
        this.aceLangTools.addCompleter(new GrafanaJSCompleter(this.aceLangTools, this, this.panel));
    }

    doShowAceJs(nodeId) {
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

    doShowAceSvg(nodeId) {
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
    removeSvgIdMapping(svgIdMapping) {
        for (let i = 0; i < this.panel.svgIdMappings.length; i++) {
            if (svgIdMapping.svgId === this.panel.svgIdMappings[i].svgId) {
                this.panel.svgIdMappings.splice(i, 1);
                this.updateMappings();
            }
        }
    }
    svgClickHandler(event) {
        if (this.panel.clickMapperEnabled) {
            let clicked = event.target;
            while (clicked.id === '') {
                clicked = clicked.parentNode;
            }
            for (let i = 0; i < this.panel.svgIdMappings.length; i++) {
                if (this.panel.svgIdMappings[i].svgId === clicked.id) {
                    return
                }
            }
            this.panel.svgIdMappings.push(
                { 'svgId': clicked.id, 'mappedName': '' }
            )
            this.$rootScope.$apply();
        }
    }
    addManualSvgIdMapping(svgIdMapping) {
        this.panel.svgIdMappings.push(
            svgIdMapping
        )
    }
    uploadSVG(event) {
        let target = event.currentTarget;
        let file = target.files[0];
        let reader = new FileReader();
        if (target.files && file) {
            reader.onload = function (event) {
                this.panel.svg_data = event.target.result;
                this.resetSVG();
            }
        }

    }
    updateClickMapper() {
        // console.log(this.panel.clickMapperEnabled);
        if (this.panel.clickMapperEnabled) {
            // document.getElementsByClassName('svg-object')[0].addEventListener('click', this.svgClickHandler.bind(this), false);
            document.getElementsByClassName('svg-object')[0].onclick = this.svgClickHandler.bind(this);
        } else {
            // document.getElementsByClassName('svg-object')[0].removeEventListener('click', this.svgClickHandler.bind(this), false);
            document.getElementsByClassName('svg-object')[0].onclick = null
        }
    }
    updateMappings() {
        this.resetSVG();
        this.render();
    }

    setUnitFormat(subItem) {
        this.panel.format = subItem.value;
        this.render();
    }

    onDataError() {
        this.data = [];
        this.render();
    }

    changeSeriesColor(series, color) {
        series.color = color;
        this.panel.aliasColors[series.alias] = series.color;
        this.render();
    }

    doInit(ctrl, svgnode) {
        try {
            ctrl.panel.doInitUserFunction(ctrl, svgnode, ctrl.svgElements);
        } catch (error) {
            console.error(`Failed to run provided user init code, check code for errors and try again. Error: ${error}`)
        }
    }

    handleMetric(ctrl, svgnode) {
        try {
            ctrl.panel.handleMetricUserFunction(ctrl, svgnode, ctrl.svgElements);
        } catch (error) {
            console.error(`Failed to run provided user event code, check code for errors and try again. Error: ${error}`)
        }
    }

    setHandleMetricFunction() {
        this.panel.handleMetricUserFunction = Function('ctrl', 'svgnode', 'svgmap', this.panel.js_code);
        this.panel.handleMetric = this.handleMetric;
    }

    setInitFunction() {
        this.initialized = 0;
        this.panel.doInitUserFunction = Function('ctrl', 'svgnode', 'svgmap', this.panel.js_init_code);
        this.panel.doInit = this.doInit;
    }

    onRender() {
        if (!_.isFunction(this.panel.handleMetric)) {
            this.setHandleMetricFunction();
        }

        if (!_.isFunction(this.panel.doInit)) {
            this.setInitFunction();
        }
    }
    handleDataFrame(data) {
        this.dataFrame = data;
    }

    onDataReceived(dataList) {
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

    resetSVG() {
        this.initialized = 0;
    }

    seriesHandler(seriesData) {
        const series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });

        series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
        return series;
    }


    docsHandler(seriesData) {
        return seriesData;
    }

    tableHandler(tableData) {

        const columnNames = tableData.columns.map(column => column.text);

        const rows = tableData.rows.map(row => {
            const datapoint = {};

            row.forEach((value, columnIndex) => {
                const key = columnNames[columnIndex];
                datapoint[key] = value;
            });

            return datapoint;
        });

        return { columnNames: columnNames, rows: rows };
    }

    getSeriesIdByAlias(aliasName) {
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].alias == aliasName) {
                return i;
            }
        }
        return -1;
    }

    getSeriesElementByAlias(aliasName) {
        var i = this.getSeriesIdByAlias(aliasName);
        if (i >= 0) {
            return this.data[i];
        }
        return null;
    }

    getDecimalsForValue(value) {
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

    formatValue(value) {
        var decimalInfo = this.getDecimalsForValue(value);
        var formatFunc = kbn.valueFormats[this.panel.format];
        if (formatFunc) {
            return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
        }
        return value;
    }

    formatValueWithFormatter(value, formatter) {
        var decimalInfo = this.getDecimalsForValue(value);
        var formatFunc = kbn.valueFormats[formatter];
        if (formatFunc) {
            return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
        }
        return value;
    }

    link(scope, elem, attrs, ctrl) {
        rendering(scope, elem, attrs, ctrl);
    }
}

SVGCtrl.templateUrl = 'module.html';