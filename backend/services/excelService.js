import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse Excel file to extract sheet information and data preview
export const parseExcel = async (filePath) => {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    
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
    
    return sheets;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file');
  }
};

// Generate chart data from Excel file
export const generateChartData = async (filePath, options) => {
  try {
    const { sheet, chartType, xAxis, yAxis, zAxis, aggregation, filters } = options;
    
    // Read the Excel file and specific sheet
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheet];
    
    if (!worksheet) {
      throw new Error(`Sheet '${sheet}' not found in the Excel file`);
    }
    
    let data = XLSX.utils.sheet_to_json(worksheet);
    
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
      chartType,
      data: chartData,
      config: {
        sheet,
        xAxis,
        yAxis,
        zAxis,
        aggregation,
        filters
      }
    };
  } catch (error) {
    console.error('Error generating chart data:', error);
    throw new Error('Failed to generate chart data');
  }
};

// Helper functions for data preparation
const preparePieChartData = (data, labelField, valueField, aggregation) => {
  const result = {};
  
  // Group data by label field
  data.forEach(row => {
    const label = row[labelField];
    const value = parseFloat(row[valueField]) || 0;
    
    if (!result[label]) {
      result[label] = 0;
    }
    
    // Apply aggregation
    switch(aggregation) {
      case 'sum':
        result[label] += value;
        break;
      case 'average':
        if (!result[`${label}_count`]) {
          result[`${label}_count`] = 0;
          result[`${label}_sum`] = 0;
        }
        result[`${label}_count`]++;
        result[`${label}_sum`] += value;
        break;
      case 'count':
        result[label]++;
        break;
      default:
        result[label] += value; // Default to sum
    }
  });
  
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
    // Skip count and sum fields for average
    if (label.endsWith('_count') || label.endsWith('_sum')) continue;
    
    formattedData.labels.push(label);
    
    // Calculate value based on aggregation
    let value;
    if (aggregation === 'average') {
      value = result[`${label}_sum`] / result[`${label}_count`];
    } else {
      value = result[label];
    }
    
    formattedData.datasets[0].data.push(value);
    formattedData.datasets[0].backgroundColor.push(colors[index % colors.length]);
    index++;
  }
  
  return formattedData;
};

const prepare2DChartData = (data, xAxis, yAxis, aggregation) => {
  // Group data by x-axis values
  const groupedData = {};
  
  data.forEach(row => {
    const xValue = row[xAxis];
    const yValue = parseFloat(row[yAxis]) || 0;
    
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
      return groupedData[label].sum / groupedData[label].count;
    } else if (aggregation === 'count') {
      return groupedData[label].count;
    } else {
      return groupedData[label].sum; // Default to sum
    }
  });
  
  return {
    labels,
    datasets: [{
      label: yAxis,
      data: values,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    }]
  };
};

const prepareScatterChartData = (data, xAxis, yAxis) => {
  const points = data.map(row => ({
    x: parseFloat(row[xAxis]) || 0,
    y: parseFloat(row[yAxis]) || 0
  }));
  
  return {
    datasets: [{
      label: `${xAxis} vs ${yAxis}`,
      data: points,
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }]
  };
};

const prepare3DChartData = (data, xAxis, yAxis, zAxis) => {
  // Format data for 3D visualization libraries (e.g., Plotly.js)
  const xValues = [];
  const yValues = [];
  const zValues = [];
  
  data.forEach(row => {
    xValues.push(parseFloat(row[xAxis]) || 0);
    yValues.push(parseFloat(row[yAxis]) || 0);
    zValues.push(parseFloat(row[zAxis]) || 0);
  });
  
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
};

export default {
  parseExcel,
  generateChartData
};