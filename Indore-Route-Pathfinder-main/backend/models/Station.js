// models/Station.js
import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  station: { type: mongoose.Schema.Types.ObjectId, ref: "Station" },
  distance: Number,
  cost: Number,
});

const stationSchema = new mongoose.Schema({
  name: String,
  connections: [connectionSchema],
});

const Station = mongoose.model("Station", stationSchema);

export default Station;
