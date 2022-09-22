// $(function() {
//     var serviceUrl = "http://localhost:5147/api/Sudoku";

//     $("#dataGrid").dxDataGrid({
//         dataSource: DevExpress.data.AspNet.createStore({
//             key: "id",
//             loadUrl: serviceUrl,
//             updateUrl: serviceUrl,
//             deleteUrl: serviceUrl
//         }),

//         remoteOperations: { groupPaging: true },
//         allowColumnResizing: true,
//         columnAutoWidth: true,
//         editing: {
//             mode: "popup",
//             allowUpdating: true,
//             allowDeleting: true
//         },
//     });
// });

$(function () {
  $("#dataGrid").dxDataGrid({
    dataSource: new DevExpress.data.CustomStore({
      key: "id",
      load: function () {
        return $.getJSON("http://localhost:5147/api/Sudoku").fail(function () {
          throw "Data loading error";
        });
      },
      remove: function(key) {
        var deferred = $.Deferred();
        $.ajax({
            url: "http://localhost:5147/api/Sudoku/" + encodeURIComponent(key),
            method: "DELETE"
        })
        .done(deferred.resolve)
        .fail(function(e){
            deferred.reject("Deletion failed");
        });
        return deferred.promise();
    },
    update: function(key, values) {
      values.solvedString = 
      console.log(JSON.stringify(values));
        var deferred = $.Deferred();
        $.ajax({
            url: "http://localhost:5147/api/Sudoku/" + encodeURIComponent(key),
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            data: JSON.stringify(values)
        })
        .done(deferred.resolve)
        .fail(function(e){
            deferred.reject("Update failed");
        });
        return deferred.promise();
    }
    }),
    allowColumnResizing: true,
    columnAutoWidth: true,
    editing: {
      mode: "popup",
      allowUpdating: false,
      allowDeleting: true,
    },
  });
});

document.querySelector('.js-back').addEventListener('click', ()=> {    
    window.location = window.location.origin;
})
