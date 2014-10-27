var Azumio = require("azumio");

var azumio = new Azumio("azumiouser", "yourpassword");
azumio.heartrate().then(function(data) {
  console.log(data);
});
