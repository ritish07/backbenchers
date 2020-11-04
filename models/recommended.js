var mongoose = require("mongoose")
var recommendedSchema = new mongoose.Schema({
  post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ]
});

var Recommended = mongoose.model("Recommended",recommendedSchema);
module.exports = Recommended;


