var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  link: String,
  upvotes: {type: Number, default: 0},
  upvotedBy: [String],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.methods.upvote = function(cb, currentUser) {
  this.upvotes += 1;
  // this.upvotedBy.push("currentUser");
  this.save(cb);
};

mongoose.model('Post', PostSchema);
