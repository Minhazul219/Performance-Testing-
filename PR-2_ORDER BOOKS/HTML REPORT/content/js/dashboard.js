/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 95.08771929824562, "KoPercent": 4.912280701754386};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0456140350877193, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Delete Order"], "isController": false}, {"data": [0.07894736842105263, 500, 1500, "Get Single Book"], "isController": false}, {"data": [0.042105263157894736, 500, 1500, "Permission"], "isController": false}, {"data": [0.010526315789473684, 500, 1500, "Update Order"], "isController": false}, {"data": [0.010526315789473684, 500, 1500, "Get Order"], "isController": false}, {"data": [0.02631578947368421, 500, 1500, "Get all book order"], "isController": false}, {"data": [0.12105263157894737, 500, 1500, "Book List"], "isController": false}, {"data": [0.08947368421052632, 500, 1500, "Get Book"], "isController": false}, {"data": [0.031578947368421054, 500, 1500, "order"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 855, 42, 4.912280701754386, 4667.4842105263115, 262, 8204, 4881.0, 7187.4, 7532.7999999999965, 7906.32, 12.695065999495167, 3.902682992694769, 3.9293485473058247], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete Order", 95, 7, 7.368421052631579, 4671.484210526319, 1901, 8011, 4811.0, 7174.200000000001, 7791.799999999999, 8011.0, 1.5548535982585638, 0.2006541125877674, 0.6384521688161836], "isController": false}, {"data": ["Get Single Book", 95, 0, 0.0, 4292.81052631579, 262, 7299, 4295.0, 6901.0, 7191.8, 7299.0, 2.5136265015610944, 0.9180628042811029, 0.4492125486188284], "isController": false}, {"data": ["Permission", 95, 7, 7.368421052631579, 5074.3263157894735, 339, 8087, 5306.0, 7501.6, 7737.199999999999, 8087.0, 2.1099857853589197, 0.6136701051106077, 0.5851046108742004], "isController": false}, {"data": ["Update Order", 95, 7, 7.368421052631579, 5458.5263157894715, 1204, 7718, 5320.0, 7352.8, 7605.0, 7718.0, 1.6182883619514854, 0.20872393171674844, 0.7198122679033797], "isController": false}, {"data": ["Get Order", 95, 7, 7.368421052631579, 5041.189473684211, 1103, 7523, 4990.0, 6940.400000000001, 7310.5999999999985, 7523.0, 1.5835444725963463, 0.6006171916672223, 0.6162117188541806], "isController": false}, {"data": ["Get all book order", 95, 7, 7.368421052631579, 5405.6631578947345, 595, 8204, 5330.0, 7532.0, 7636.599999999999, 8204.0, 1.7487022788351803, 0.6585136778430217, 0.5815945058535508], "isController": false}, {"data": ["Book List", 95, 0, 0.0, 3510.6210526315786, 265, 6683, 3796.0, 6036.0, 6218.5999999999985, 6683.0, 3.0465317641022356, 1.8773061944809672, 0.5384982903344772], "isController": false}, {"data": ["Get Book", 95, 0, 0.0, 3082.36842105263, 513, 5555, 3206.0, 4758.0, 4988.799999999999, 5555.0, 3.7747844399411927, 0.833106722096396, 0.674595266122303], "isController": false}, {"data": ["order", 95, 7, 7.368421052631579, 5470.368421052631, 813, 8007, 6198.0, 7610.6, 7712.4, 8007.0, 1.887692246552478, 0.4905710082760402, 0.7494883360489608], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["401/Unauthorized", 21, 50.0, 2.456140350877193], "isController": false}, {"data": ["404/Not Found", 14, 33.333333333333336, 1.6374269005847952], "isController": false}, {"data": ["409/Conflict", 7, 16.666666666666668, 0.8187134502923976], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 855, 42, "401/Unauthorized", 21, "404/Not Found", 14, "409/Conflict", 7, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Delete Order", 95, 7, "404/Not Found", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Permission", 95, 7, "409/Conflict", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Update Order", 95, 7, "404/Not Found", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get Order", 95, 7, "401/Unauthorized", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Get all book order", 95, 7, "401/Unauthorized", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["order", 95, 7, "401/Unauthorized", 7, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
