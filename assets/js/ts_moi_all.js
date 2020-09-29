function fetchCheckStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }
  
  function loadData(url) {
    var option = {
      method: "GET",
      headers: new Headers(),
      mode: "cors",
      cache: "default"
    };
  
    return fetch(url, option)
      .then(fetchCheckStatus)
      .then(function(resp) {
        var contentType = resp.headers.get("Content-Type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return resp.json();
        } else {
          return resp.text();
        }
      })
      .then(function(data_moi_all) {
        return data_moi_all;
      })
      .catch(function(err) {
        console.log("Something went wrong! Please check data/schema files");
      });
  }
  
    var schema_moi_all = [{
      "name": "Time",
      "type": "date",
      "format": "%-d/%-m/%Y" // NEW fixed format
    }, {
      "name": "DOM Durham",
      "type": "number"
    }, {
      "name": "DOM Oshawa",
      "type": "number"
    }];
  
  
  var data_moi_all, dataStore_moi_all;
  
  
  function formatJSON_moi_all(entries) {
      var formattedJSON_moi_all = [];
    entries.forEach(item => formattedJSON_moi_all.push([item.gsx$date.$t, parseFloat(item.gsx$avgdomalldrhm.$t), parseFloat(item.gsx$avgdomallosh.$t)]));
    return formattedJSON_moi_all; // NEW return values
  };
  
  Promise.all([
    loadData(
      "https://spreadsheets.google.com/feeds/list/1ghkpKiuX7ZdANRb6YhDLt9SgdkrAsxgA_YsMYsker9c/1/public/values?alt=json"
    )
  ]).then(function(res) {
    data_moi_all = formatJSON_moi_all(res[0].feed.entry); // NEW added function to format incoming JSON
  
    dataStore_moi_all = new FusionCharts.DataStore(data_moi_all, schema_moi_all);
  
    new FusionCharts({
      type: "timeseries",
      renderAt: "chart-container_moi_all",
      id: "moi_all",
      width: "100%",
      height: "100%",
      dataSource: {
        chart: {
          multiCanvas: true,
          canvasHeightProportion: "1:1",
          "theme": "candy",
        },
        caption: {
          text: "Days on Market"
        },
        subcaption: {
          text: "The average days on market on Durham and Oshawa"
        },
        yAxis: [
          {
            plot: {
              value: "Avg Sale Prices",
              type: "line"
            },
            title: "DOM Durham",
            format: {
              prefix: "days"
            }
          },
          {
            plot: {
              value: "Change in Avg Sale Prices",
              type: "line"
            },
            title: "DOM Oshawa",
            format: {
                prefix: "days"
              }
          }
        ],
        data: dataStore_moi_all.getDataTable()
      }
    }).render();
  });
  