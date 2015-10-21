function getData() {
  $.ajax({
    url: "http://localhost:3000/api/example",
    method: "GET",
    error: function(err) {
      console.log(err);
    },
    success: function(data) {
      console.log(data);
    }
  });
}

getData();
