

new Vue({ el: '#app' })

google.charts.load('current', { 'packages': ['annotationchart'] });   // Don't need to specify chart libraries!


// Query the battery level from "Sheet 2|column D" in the spreadsheet.
function queryBatteryLevel() {
  let opts = { sendMethod: 'auto' };
  let query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet2&headers=1', opts);
  query.setQuery('SELECT D');
  query.send(handleQueryBatteryLevelResponse);
}

function handleQueryBatteryLevelResponse(response) {
  let data = response.getDataTable()
  let battery_level = data.getValue(0, 0)
  console.log(battery_level)

  /*    3	100
     2.87	90
     2.74	80
     2.61	70
     2.48	60
     2.35	50
     2.22	40
     2.09	30
     1.96	20
     1.83	10
     1.7	0 */

  let battery_level_icon = ""
  if (battery_level > 2.9) {
    battery_level_icon = "svg/baseline-battery_full-24px.svg"
  } else if (battery_level > 2.87) {
    battery_level_icon = "svg/baseline-battery_90-24px.svg"
  } else if (battery_level > 2.74) {
    battery_level_icon = "svg/baseline-battery_80-24px.svg"
  } else if (battery_level > 2.48) {
    battery_level_icon = "svg/baseline-battery_60-24px.svg"
  } else if (battery_level > 2.35) {
    battery_level_icon = "svg/baseline-battery_50-24px.svg"
  } else if (battery_level > 2.22) {
    battery_level_icon = "svg/baseline-battery_40-24px.svg"
  } else if (battery_level > 2.09) {
    battery_level_icon = "svg/baseline-battery_30-24px.svg"
  } else if (battery_level > 1.96) {
    battery_level_icon = "svg/baseline-battery_20-24px.svg"
  } else if (battery_level > 1.83) {
    battery_level_icon = "svg/baseline-battery_10-24px.svg"
  } else {
    battery_level_icon = "svg/baseline-battery_alert-24px.svg"
  }

  let battery_id = document.getElementById("battery")
  battery_id.setAttribute("src", battery_level_icon)
}


function queryTemperatureLog() {
  let opts = { sendMethod: 'auto' };
  let query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet1&headers=1', opts);
  query.setQuery('SELECT A, E WHERE datediff(now(), A) < 30');
  query.setRefreshInterval(0)
  query.send(handleQueryTemperatureLogResponse);
}

function timeBucket(d) {
  d.setSeconds(0)
  d.setMinutes( Math.floor(d.getMinutes() / 20) * 20 )
  return d
}

function handleQueryTemperatureLogResponse(response) {
  let data = response.getDataTable()

  let view = google.visualization.data.group(
    data, 
    [ { 'column': 0, 'modifier': timeBucket, 'type': 'date' } ], 
    [ { 'column': 1, 'aggregation': google.visualization.data.avg, 'type': 'number' } ]
  )

  console.log(data.getValue(0, 0))
  console.log(data.getNumberOfRows())
  console.log(view.getNumberOfRows())
  // console.log(view)

  let chart = new google.visualization.AnnotationChart(document.getElementById('temperature_chart_div'));

  let nowMinus7Days = new Date()
  nowMinus7Days.setDate(nowMinus7Days.getDate() - 7)

  let options = {
    displayAnnotations: false,
    fill: 10,
    zoomStartTime: nowMinus7Days,
    dateFormat: "HH:mm MMM dd, YYYY",
    displayDateBarSeparator: true,
    displayLegendDots: true,
  };

  chart.draw(view, options);
}

function drawCharts() {
  queryBatteryLevel()
  queryTemperatureLog()
}


google.charts.setOnLoadCallback(drawCharts);
