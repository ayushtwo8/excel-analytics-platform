import mongoose from "mongoose";
const Schema = mongoose.Schema;

const FileSchema = new Schema(
  {
    fileId: {
      type: String,
      required: true,
      unique: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    mimetype: String,
    size: Number,
    uploadedBy: {
      type: String,
      required: true,
    },
    sheets: [
      {
        name: String,
        columns: [String],
        rowCount: Number,
      },
    ],
    charts: [
      {
        title: {
          type: String,
          required: true,
          default: "Untitled Chart",
        },
        type: {
          type: String,
          required: true,
        },
        config: {
          sheet: String,
          xAxis: String,
          yAxis: String,
          zAxis: String,
          aggregation: String,
          filters: mongoose.Schema.Types.Mixed,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const FileModel = mongoose.model("File", FileSchema);
export default FileModel;
