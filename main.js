/**
 * Created by leif.arne.rones on 08.07.2017.
 */

var minmax_config_form = document.getElementById("minmax_config_form");
var min_temp = document.getElementById("mintemp");
var max_temp = document.getElementById("maxtemp");
var save_button = document.getElementById("save_button");
var temp_div = document.getElementById('temp_div');
var bat_div = document.getElementById('bat_div');
var db_div = document.getElementById('db_div');
var annotation_div = document.getElementById('annotation_div');

var temp_chart;
var bat_chart;
var db_chart;

min_temp.onkeyup = enableSaveButton;
max_temp.onkeyup = enableSaveButton;

// Saves message on form submit.
minmax_config_form.onsubmit = function(e) {
    e.preventDefault();
    var mintemp = min_temp.value;
    var maxtemp = max_temp.value;
    if (mintemp && maxtemp) {
        save_button.disabled = true;
        saveConfigToSheet(mintemp, maxtemp);
    }
};

//save_button.onclick = loadConfigFromSheet;

var sheetsApiLoaded = false;

// var pageSplash;

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['gauge', 'annotationchart']});
google.charts.setOnLoadCallback(drawSheetName);


// Sheets api is used only to save min-max temperature limits.
// TODO: Remove sheets api. Use appscript for saving config


gapi.load('client:auth2', loadSheetsApi);


function loadSheetsApi() {

    gapi.client.init({
        clientId: '1046614295942-2cvmq6ujplnh8668hrhu32u5kqpaui1k.apps.googleusercontent.com',
        clientSecret: 'WTOnT3mSS25Av48kdwErJ2hJ',
        apiKey: 'AIzaSyCtNi6nu1IF2wBcXg0rtIY0IxMLEIoLMz8',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets'
    }).then(function () {
        //pageSplash = document.getElementById("page-splash");

        gapi.auth2.getAuthInstance().isSignedIn.listen(loadConfigFromSheet);
        loadConfigFromSheet(gapi.auth2.getAuthInstance().isSignedIn.get());

        sheetsApiLoaded = true;
    }, function (reason) {
        sheetsApiLoaded = false;
    });
}

function handleSignInClick(event) {
    // Ideally the button should only show up after gapi.client.init finishes, so that this
    // handler won't be called before OAuth is initialized.
    gapi.auth2.getAuthInstance().signIn();
}


function loadConfigFromSheet(isSignedIn) {

    if (!isSignedIn) {
//            pageSplash.style.display = '';
//            document.getElementsByTagName("header")[0].style.display = 'none';
//            document.getElementsByTagName("main")[0].style.display = 'none';
        return;
    }

//        pageSplash.style.display = 'none';

    var request = {
        spreadsheetId: '1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0',
        range: 'Sheet1!A1:D5'
    };

    gapi.client.sheets.spreadsheets.values.get(request).then( function(response) {
        // TODO: Change code below to process the `response` object:
        console.log(JSON.stringify(response, null, 2));
    }, function(err) {
        console.log(err);
    });
}


function enableSaveButton(e) {
    save_button.disabled = false;
}

function saveConfigToSheet(mintemp, maxtemp) {

    var request = {
        spreadsheetId: '1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0',
        range: 'Sheet2!G2:H2',
        valueInputOption: 'USER_ENTERED',
        values: [ [mintemp, maxtemp] ]
    };

    gapi.client.sheets.spreadsheets.values.update(request).then( function(response) {
        redrawTemp();
        console.log(response);
    }, function(err) {
        console.log(err);
    });
}


function redrawTemp() {
    var queryString = encodeURIComponent('SELECT D, E, F, G, H ');
    var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet2&headers=1&tq=' + queryString);
    query.setRefreshInterval(10);
    query.send(handleRedrawTempQueryResponse);
}


function handleRedrawTempQueryResponse(response) {
    if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    var data = response.getDataTable();

    var min_temp = data.getValue(0, 3);
    var max_temp = data.getValue(0, 4);

    var temp_options = {
        width: 200, height: 120,
        greenFrom: min_temp, greenTo: max_temp,
        yellowFrom: max_temp, yellowTo: 100,
        redFrom: 0, redTo: min_temp,
        minorTicks: 5
    };

    var view = new google.visualization.DataView(data);

    view.setColumns([1]);
    temp_chart.draw(view, temp_options);
}


// Load values using charts api from this point, including gauge values and min-max limits

function drawSheetName() {
    temp_chart = new google.visualization.Gauge(temp_div);
    bat_chart = new google.visualization.Gauge(bat_div);
    db_chart = new google.visualization.Gauge(db_div);

    var queryString = encodeURIComponent('SELECT D, E, F, G, H ');
    var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet2&headers=1&tq=' + queryString);
    query.setRefreshInterval(10);

    query.send(handleSampleDataQueryResponse);

    // var queryString2 = encodeURIComponent('SELECT A, E, D ');
    // var query2 = new google.visualization.Query(
    //     'https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet1&headers=1&tq=' + queryString2);
    // query2.send(handleSampleDataQueryResponse2);

    drawAnnotationChart();
}


function drawAnnotationChart() {
    var options = {
        displayAnnotations: false,
        scaleColumns: [1, 2],
        scaleType: 'allmaximized'

    };
    var annotationChartWrapper = new google.visualization.ChartWrapper();
    annotationChartWrapper.setChartType('AnnotationChart');
    annotationChartWrapper.setContainerId('annotation_div')
    annotationChartWrapper.setDataSourceUrl('https://docs.google.com/spreadsheets/d/1uc6llAnOdh1vL6J6UeYSrod4NYAzGgxtsSXs3yvKfO0/edit?sheet=Sheet1&headers=1');
    annotationChartWrapper.setQuery('SELECT A, E, D LIMIT 1000');
    annotationChartWrapper.setOptions(options);
    annotationChartWrapper.setRefreshInterval(10);
    annotationChartWrapper.draw();
}

function handleSampleDataQueryResponse(response) {
    if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    var data = response.getDataTable();

    var min_temp = data.getValue(0, 3);
    var max_temp = data.getValue(0, 4);


    var temp_options = {
        width: 200, height: 120,
        greenFrom: min_temp, greenTo: max_temp,
        yellowFrom: max_temp, yellowTo: 100,
        redFrom: 0, redTo: min_temp,
        minorTicks: 5
    };
    var bat_options = {
        width: 200, height: 120,
        greenFrom: 3.5, greenTo: 5,
        yellowFrom: 3.2, yellowTo: 3.5,
        redFrom: 0, redTo: 3.2,
        minorTicks: 5,
        min: 0,
        max: 5
    };
    var db_options = {
        width: 200, height: 120,
        greenFrom: -80, greenTo: 0,
        yellowFrom: -100, yellowTo: -80,
        redFrom: -130, redTo: -100,
        minorTicks: 5,
        min: -150,
        max: 0
    };

    var view = new google.visualization.DataView(data);

    view.setColumns([1]);
    temp_chart.draw(view, temp_options);

    view.setColumns([0]);
    bat_chart.draw(view, bat_options);

    view.setColumns([2]);
    db_chart.draw(view, db_options);

    mintemp.value = min_temp;
    maxtemp.value = max_temp;
}

function handleSampleDataQueryResponse2(response) {
    if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    var options = {
        displayAnnotations: false,
        scaleColumns: [1, 2],
        scaleType: 'allfixed'

    };

    var data = response.getDataTable();

    var chart = new google.visualization.AnnotationChart(annotation_div);
    chart.draw(data, options);
}
