import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FileSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  filepath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  mimetype: String,
  size: Number,
  uploadedBy: {
    type: String,
    required: true
  },
  sheets: [{
    name: String,
    columns: [String],
    rowCount: Number
  }],
  charts: [{
    title: {
      type: String,
      default: 'Untitled Chart'
    },
    type: String,  // pie, bar, line, scatter, 3d, etc.
    config: {
      sheet: String,
      xAxis: String,
      yAxis: String,
      zAxis: String,
      aggregation: String,
      filters: Array
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const FileModel = mongoose.model('File', FileSchema);
export default FileModel;