new Vue({ el: '#app' })

google.charts.load('current');   // Don't need to specify chart libraries!


// Query the battery level from "Sheet 2|column D" in the spreadsheet.
function queryBatteryLevel() {
    var opts = {sendMethod: 'auto'};
    var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet2&headers=1', opts);
    query.setQuery('SELECT D');
    query.send(handleQueryBatteryLevelResponse);
}

function handleQueryBatteryLevelResponse(response) {
    var data = response.getDataTable()
    var battery_level = data.getValue(0,0)
    console.log(battery_level)

    var battery_level_icon = ""
    if (battery_level > 2.0) {
        battery_level_icon = "svg/baseline-battery_full-24px.svg"
    } else if (battery_level > 1.9) {
        battery_level_icon = "svg/baseline-battery_90-24px.svg"
    } else if (battery_level > 1.8) {
        battery_level_icon = "svg/baseline-battery_80-24px.svg"
    } else if (battery_level > 1.7) {
        battery_level_icon = "svg/baseline-battery_60-24px.svg"
    } else if (battery_level > 1.6) {
        battery_level_icon = "svg/baseline-battery_50-24px.svg"
    } else {
        battery_level_icon = "svg/baseline-battery_alert-24px.svg"
    }

    var battery_id = document.getElementById("battery")
    battery_id.setAttribute("src", battery_level_icon)
}



function drawTemperatureChart() {
    google.visualization.drawChart({
        "containerId": "temperature_chart_div",
        "dataSourceUrl": "https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet1&headers=1",
        "query":"SELECT A, E WHERE datediff(now(), A) < 7",
        "refreshInterval": 5,
        "chartType": "AnnotationChart",
        "options": {
            "alternatingRowStyle": true,
            "showRowNumber" : true
        }
    });
}

function drawCharts() {
    queryBatteryLevel()
    drawTemperatureChart()
}


google.charts.setOnLoadCallback(drawCharts);