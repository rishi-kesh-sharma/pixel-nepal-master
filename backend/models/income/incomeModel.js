const mongoose = require("mongoose");

const estimationIncomeSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  totalIncome: { type: Number, default: 0 }, // Total income from premium users
  /*  daily_average: { type: Number, required: true, default: 0 },
  monthly_average: { type: Number, required: true, default: 0 },
  weekly_average: { type: Number, required: true, default: 0 },
  yearly_average: { type: Number, required: true, default: 0 }, */
});

module.exports = mongoose.model("EstimationIncome", estimationIncomeSchema);
