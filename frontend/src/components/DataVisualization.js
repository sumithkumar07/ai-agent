import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, Download, Upload } from 'lucide-react';
import AccessibleButton from './AccessibleButton';

const DataVisualization = () => {
  const [selectedChart, setSelectedChart] = useState('bar');
  const [data, setData] = useState('');
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart', icon: BarChart3, description: 'Compare categories' },
    { id: 'line', label: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
    { id: 'pie', label: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
  ];

  const parseData = () => {
    try {
      const parsed = JSON.parse(data);
      
      // Validate data structure based on chart type
      if (selectedChart === 'bar' && (!parsed.labels || !parsed.values)) {
        throw new Error('Bar chart requires "labels" and "values" arrays');
      }
      if (selectedChart === 'line' && (!parsed.x || !parsed.y)) {
        throw new Error('Line chart requires "x" and "y" arrays');
      }
      if (selectedChart === 'pie' && (!parsed.labels || !parsed.values)) {
        throw new Error('Pie chart requires "labels" and "values" arrays');
      }

      setChartData(parsed);
      setError('');
    } catch (err) {
      setError(`Invalid JSON data: ${err.message}`);
      setChartData(null);
    }
  };

  const generateSampleData = () => {
    const samples = {
      bar: {
        labels: ['Product A', 'Product B', 'Product C', 'Product D'],
        values: [23, 45, 56, 78],
        title: 'Sales by Product'
      },
      line: {
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        y: [10, 15, 13, 17, 19, 23],
        title: 'Monthly Growth'
      },
      pie: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        values: [60, 35, 5],
        title: 'Traffic Sources'
      }
    };

    setData(JSON.stringify(samples[selectedChart], null, 2));
    setChartData(samples[selectedChart]);
    setError('');
  };

  const renderChart = () => {
    if (!chartData) return null;

    // Simple SVG-based chart rendering
    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (selectedChart === 'bar') {
      const maxValue = Math.max(...chartData.values);
      const barWidth = chartWidth / chartData.labels.length;
      
      return (
        <svg width={width} height={height} className="border rounded">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {chartData.labels.map((label, index) => {
              const barHeight = (chartData.values[index] / maxValue) * chartHeight;
              const x = index * barWidth;
              const y = chartHeight - barHeight;
              
              return (
                <g key={label}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth * 0.8}
                    height={barHeight}
                    fill="#3B82F6"
                    className="hover:fill-blue-700 transition-colors"
                  />
                  <text
                    x={x + (barWidth * 0.4)}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {label}
                  </text>
                  <text
                    x={x + (barWidth * 0.4)}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-900"
                  >
                    {chartData.values[index]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      );
    }

    if (selectedChart === 'line') {
      const maxY = Math.max(...chartData.y);
      const stepX = chartWidth / (chartData.x.length - 1);
      
      const points = chartData.y.map((value, index) => {
        const x = index * stepX;
        const y = chartHeight - (value / maxY) * chartHeight;
        return `${x},${y}`;
      }).join(' ');

      return (
        <svg width={width} height={height} className="border rounded">
          <g transform={`translate(${margin.left},${margin.top})`}>
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points={points}
            />
            {chartData.y.map((value, index) => {
              const x = index * stepX;
              const y = chartHeight - (value / maxY) * chartHeight;
              
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3B82F6"
                    className="hover:fill-blue-700 transition-colors"
                  />
                  <text
                    x={x}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {chartData.x[index]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      );
    }

    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded">
        <p className="text-gray-500 dark:text-gray-400">Chart rendering not implemented for {selectedChart}</p>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Visualization</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Create interactive charts and graphs from your data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Chart Configuration
          </h3>
          
          {/* Chart Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Chart Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label key={type.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="chartType"
                      value={type.id}
                      checked={selectedChart === type.id}
                      onChange={(e) => setSelectedChart(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border-2 rounded-full mr-3 ${
                      selectedChart === type.id 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedChart === type.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                      )}
                    </div>
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{type.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Data Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="chart-data" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Chart Data (JSON)
              </label>
              <AccessibleButton
                variant="ghost"
                size="sm"
                onClick={generateSampleData}
                ariaLabel="Generate sample data"
              >
                Sample Data
              </AccessibleButton>
            </div>
            <textarea
              id="chart-data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={`Enter JSON data for ${selectedChart} chart...`}
            />
          </div>

          {/* Data Format Help */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Chart Format:
            </h4>
            <pre className="text-xs text-blue-800 dark:text-blue-200">
              {selectedChart === 'bar' && `{
  "labels": ["A", "B", "C"],
  "values": [10, 20, 15],
  "title": "Chart Title"
}`}
              {selectedChart === 'line' && `{
  "x": ["Jan", "Feb", "Mar"],
  "y": [10, 15, 12],
  "title": "Chart Title"  
}`}
              {selectedChart === 'pie' && `{
  "labels": ["A", "B", "C"],
  "values": [30, 40, 30],
  "title": "Chart Title"
}`}
            </pre>
          </div>

          {/* Error Display */}
          {error && (
            <div role="alert" className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <AccessibleButton
              onClick={parseData}
              disabled={!data.trim()}
              icon={BarChart3}
              ariaLabel="Generate chart from data"
            >
              Generate Chart
            </AccessibleButton>
            
            {chartData && (
              <AccessibleButton
                variant="secondary"
                icon={Download}
                ariaLabel="Download chart data"
                onClick={() => {
                  const dataStr = JSON.stringify(chartData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'chart-data.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download
              </AccessibleButton>
            )}
          </div>
        </div>

        {/* Chart Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Chart Preview
          </h3>
          
          {chartData ? (
            <div className="space-y-4">
              {chartData.title && (
                <h4 className="text-center font-medium text-gray-900 dark:text-white">
                  {chartData.title}
                </h4>
              )}
              
              <div className="flex justify-center">
                {renderChart()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Enter data and click "Generate Chart" to see your visualization
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;