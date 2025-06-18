import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { buffer } from 'stream/consumers';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse Excel file to extract sheet information and data preview
export const parseExcel = async (filePath) => {
  try {
    console.log('Parsing Excel file:', filePath);
    // Read the Excel file
    
    let fileDataAsBuffer;

    if(Buffer.isBuffer(filePath)){
      console.log("parsing from buffer..");
      fileDataAsBuffer = filePath;
    } else {
      console.log('Parsing Excel file from path:', filePath);
      const fileBuffer = await fs.readFile(filePath);
      fileDataAsBuffer = await fs.readFile(filePath);

    }

    const workbook = XLSX.read(fileDataAsBuffer, { type: 'buffer'})
    
    // Extract sheet information
    const sheets = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract columns (assuming first row contains headers)
      const columns = jsonData[0] || [];
      
      sheets.push({
        name: sheetName,
        columns: columns,
        rowCount: jsonData.length - 1, // Exclude header row
        data: jsonData.slice(0, 50) // Send first 50 rows for preview
      });
    });
    console.log("Parsing successful")
    
    return sheets;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

// Generate chart data from Excel file
export const generateChartData = async (workbook, options) => {
  try {
    const { sheet, chartType, xAxis, yAxis, zAxis, aggregation, filters, title } = options;
        
    // Read the Excel file and specific sheet
    
    if (!workbook.SheetNames.includes(sheet)) {
      throw new Error(`Sheet '${sheet}' not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
    }
    
    const worksheet = workbook.Sheets[sheet];
    
    if (!worksheet) {
      throw new Error(`Sheet '${sheet}' not found in the Excel file`);
    }
    
    let data = XLSX.utils.sheet_to_json(worksheet);
    
    if (!data || data.length === 0) {
      throw new Error('No data found in the selected sheet');
    }
    
    console.log(`Parsed ${data.length} rows from sheet`);
    console.log('Sample data row:', JSON.stringify(data[0]));
    
    // Check if the selected columns exist
    const firstRow = data[0];
    if (!firstRow.hasOwnProperty(xAxis)) {
      const availableColumns = Object.keys(firstRow);
      throw new Error(`Column '${xAxis}' not found. Available columns: ${availableColumns.join(', ')}`);
    }
    
    if (yAxis && !firstRow.hasOwnProperty(yAxis)) {
      const availableColumns = Object.keys(firstRow);
      throw new Error(`Column '${yAxis}' not found. Available columns: ${availableColumns.join(', ')}`);
    }
    
    if (zAxis && chartType === '3d' && !firstRow.hasOwnProperty(zAxis)) {
      const availableColumns = Object.keys(firstRow);
      throw new Error(`Column '${zAxis}' not found. Available columns: ${availableColumns.join(', ')}`);
    }
    
    // Apply filters if provided
    if (filters && Array.isArray(filters)) {
      data = data.filter(row => {
        return filters.every(filter => {
          const { column, operator, value } = filter;
          
          switch(operator) {
            case 'equals':
              return row[column] === value;
            case 'contains':
              return String(row[column]).includes(value);
            case 'greater':
              return row[column] > value;
            case 'less':
              return row[column] < value;
            default:
              return true;
          }
        });
      });
    }
    
    // Prepare chart data based on chart type
    let chartData;
    
    switch(chartType) {
      case 'pie':
        chartData = preparePieChartData(data, xAxis, yAxis, aggregation);
        break;
      case 'bar':
      case 'line':
        chartData = prepare2DChartData(data, xAxis, yAxis, aggregation);
        break;
      case 'scatter':
        chartData = prepareScatterChartData(data, xAxis, yAxis);
        break;
      case '3d':
        chartData = prepare3DChartData(data, xAxis, yAxis, zAxis);
        break;
      default:
        chartData = prepare2DChartData(data, xAxis, yAxis, aggregation);
    }
    
    return {
      // chartType,
      data: chartData,
      config: {
        sheet,
        chartType,
        xAxis,
        yAxis,
        zAxis: chartType === '3d' ? zAxis : undefined,
        aggregation,
        filters,
        title: title || `${chartType} of ${xAxis} vs ${yAxis}`
      }
    };
  } catch (error) {
    console.error('Error generating chart data:', error);
    throw new Error(`Failed to generate chart data: ${error.message}`);
  }
};

// Helper functions for data preparation
const preparePieChartData = (data, labelField, valueField, aggregation) => {
  try {
    const result = {};
    const countMap = {};
    const sumMap = {};
    
    // Group data by label field
    data.forEach(row => {
      if (row[labelField] === undefined || row[labelField] === null) {
        return; // Skip rows with missing label
      }
      
      const label = String(row[labelField] || "N/A");
      let value = 0;
      
      if (valueField) {
        value = parseFloat(row[valueField]);
        if (isNaN(value)) value = 0;
      } else {
        value = 1; // For counting
      }
      
      if (!result[label]) {
        result[label] = 0;
        countMap[label] = 0;
        sumMap[label] = 0;
      }
      
      // Apply aggregation
      switch(aggregation) {
        case 'sum':
          result[label] += value;
          break;
        case 'average':
          sumMap[label] += value;
          countMap[label]++;
          break;
        case 'count':
          result[label]++;
          break;
        default:
          result[label] += value; // Default to sum
      }
    });
    
    // Calculate averages if needed
    if (aggregation === 'average') {
      Object.keys(countMap).forEach(label => {
        if (countMap[label] > 0) {
          result[label] = sumMap[label] / countMap[label];
        } else {
          result[label] = 0;
        }
      });
    }
    
    // Format for chart.js
    const formattedData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };
    
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#7FD8BE', '#EC932F', '#5DA5DA', '#FAA43A'
    ];
    
    let index = 0;
    for (const label in result) {
      formattedData.labels.push(label);
      formattedData.datasets[0].data.push(result[label]);
      formattedData.datasets[0].backgroundColor.push(colors[index % colors.length]);
      index++;
    }
    
    return formattedData;
  } catch (error) {
    console.error('Error preparing pie chart data:', error);
    throw error;
  }
};

const prepare2DChartData = (data, xAxis, yAxis, aggregation) => {
  try {
    // Group data by x-axis values
    const groupedData = {};
    
    data.forEach(row => {
      if (row[xAxis] === undefined || row[xAxis] === null) {
        return; // Skip rows with missing x value
      }
      
      const xValue = String(row[xAxis] || "N/A");
      let yValue = 0;
      
      if (yAxis) {
        yValue = parseFloat(row[yAxis]);
        if (isNaN(yValue)) yValue = 0;
      } else {
        yValue = 1; // For counting
      }
      
      if (!groupedData[xValue]) {
        groupedData[xValue] = {
          sum: 0,
          count: 0
        };
      }
      
      groupedData[xValue].sum += yValue;
      groupedData[xValue].count++;
    });
    
    // Format for chart.js
    const labels = Object.keys(groupedData);
    const values = labels.map(label => {
      if (aggregation === 'average') {
        return groupedData[label].count > 0 ? groupedData[label].sum / groupedData[label].count : 0;
      } else if (aggregation === 'count') {
        return groupedData[label].count;
      } else {
        return groupedData[label].sum; // Default to sum
      }
    });
    
    return {
      labels,
      datasets: [{
        label: yAxis || 'Count',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }]
    };
  } catch (error) {
    console.error('Error preparing 2D chart data:', error);
    throw error;
  }
};

const prepareScatterChartData = (data, xAxis, yAxis) => {
  try {
    const points = data.map(row => {
      const x = parseFloat(row[xAxis]);
      const y = parseFloat(row[yAxis]);
      
      // Skip points with NaN values
      if (isNaN(x) || isNaN(y)) return null;
      
      return {
        x: x,
        y: y
      };
    }).filter(point => point !== null); // Remove null points
    
    if (points.length === 0) {
      throw new Error('No valid data points for scatter plot. Check that your columns contain numeric data.');
    }
    
    return {
      datasets: [{
        label: `${xAxis} vs ${yAxis}`,
        data: points,
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }]
    };
  } catch (error) {
    console.error('Error preparing scatter chart data:', error);
    throw error;
  }
};

const prepare3DChartData = (data, xAxis, yAxis, zAxis) => {
  try {
    if (!zAxis) {
      throw new Error('Z-axis is required for 3D charts');
    }
    
    // Format data for 3D visualization libraries (e.g., Plotly.js)
    const xValues = [];
    const yValues = [];
    const zValues = [];
    
    data.forEach(row => {
      const x = parseFloat(row[xAxis]);
      const y = parseFloat(row[yAxis]);
      const z = parseFloat(row[zAxis]);
      
      // Skip points with NaN values
      if (isNaN(x) || isNaN(y) || isNaN(z)) return;
      
      xValues.push(x);
      yValues.push(y);
      zValues.push(z);
    });
    
    if (xValues.length === 0) {
      throw new Error('No valid data points for 3D chart. Check that your columns contain numeric data.');
    }
    
    return {
      x: xValues,
      y: yValues,
      z: zValues,
      mode: 'markers',
      marker: {
        size: 5,
        color: zValues,
        colorscale: 'Viridis'
      },
      type: 'scatter3d'
    };
  } catch (error) {
    console.error('Error preparing 3D chart data:', error);
    throw error;
  }
};
