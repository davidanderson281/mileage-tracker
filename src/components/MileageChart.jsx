import React, { useState, useMemo } from 'react';

export default function MileageChart({ readings, car }) {
  const [useCanvas, setUseCanvas] = useState(true);

  // Check if recharts is available
  const canUseRecharts = useMemo(() => {
    try {
      require('recharts');
      return true;
    } catch {
      return false;
    }
  }, []);

  // Prepare data for visualization
  const chartData = useMemo(() => {
    const sorted = [...readings].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sorted.map(reading => {
      let expected = null;
      if (car?.annualLimit) {
        const readingDate = new Date(reading.date);
        const delivery = car.deliveryMileage ?? 0;
        const msPerDay = 1000 * 60 * 60 * 24;

        if (car.contractEndDate && car.contractMonths > 0) {
          const endDate = new Date(car.contractEndDate);
          const startDate = new Date(endDate);
          startDate.setMonth(startDate.getMonth() - car.contractMonths);
          const totalDays = Math.max((endDate - startDate) / msPerDay, 1);
          const elapsedDays = Math.min(Math.max((readingDate - startDate) / msPerDay, 0), totalDays);
          const totalContractMiles = car.annualLimit * (car.contractMonths / 12);
          expected = delivery + (totalContractMiles * (elapsedDays / totalDays));
        } else {
          const yearStart = new Date(readingDate.getFullYear(), 0, 1);
          const daysIntoYear = Math.floor((readingDate - yearStart) / msPerDay);
          expected = delivery + (car.annualLimit / 365) * daysIntoYear;
        }
      }

      return {
        date: new Date(reading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: reading.date,
        actual: reading.mileage,
        expected: expected ? Math.round(expected) : null
      };
    });
  }, [readings, car]);

  if (!car?.annualLimit) {
    return null;
  }

  // Canvas-based simple line chart
  if (useCanvas && !canUseRecharts) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 Mileage Trend</h3>
        <CanvasChart data={chartData} />
        {canUseRecharts && (
          <button
            onClick={() => setUseCanvas(false)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Switch to Advanced Chart
          </button>
        )}
      </div>
    );
  }

  // Recharts-based chart (if available)
  if (canUseRecharts) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 Mileage Trend</h3>
        <RechartsChart data={chartData} />
      </div>
    );
  }

  return null;
}

// Simple canvas-based chart for when recharts is not available
function CanvasChart({ data }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const padding = 60;
    const width = canvas.width;
    const height = canvas.height;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas with dark background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Get max value
    const maxValue = Math.max(
      ...data.map(d => d.actual),
      ...data.filter(d => d.expected).map(d => d.expected)
    );

    const scaleY = (value) => height - padding - (value / maxValue) * chartHeight;
    const scaleX = (index) => padding + (index / (data.length - 1)) * chartWidth;

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Setup text color for dark theme
    ctx.fillStyle = '#d1d5db';

    // Draw expected line
    if (data.some(d => d.expected)) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        if (point.expected) {
          const x = scaleX(i);
          const y = scaleY(point.expected);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw actual line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const x = scaleX(i);
      const y = scaleY(point.actual);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw points
    data.forEach((point, i) => {
      const x = scaleX(i);
      const y = scaleY(point.actual);
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < data.length; i += Math.max(1, Math.floor(data.length / 8))) {
      const x = scaleX(i);
      ctx.fillText(data[i].date, x, height - 30);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxValue / 5) * i);
      const y = height - padding - (chartHeight / 5) * i;
      ctx.fillText(value, padding - 10, y + 4);
    }

    // Legend
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(width - 200, 10, 16, 16);
    ctx.fillStyle = '#d1d5db';
    ctx.textAlign = 'left';
    ctx.fillText('Actual Mileage', width - 175, 22);

    ctx.fillStyle = '#10b981';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(width - 200, 35, 16, 16);
    ctx.setLineDash([]);
    ctx.fillStyle = '#d1d5db';
    ctx.fillText('Expected Mileage', width - 175, 47);
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="w-full border border-gray-600 rounded-md"
    />
  );
}

// Recharts-based chart
function RechartsChart({ data }) {
  let LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;
  
  try {
    const recharts = require('recharts');
    LineChart = recharts.LineChart;
    Line = recharts.Line;
    XAxis = recharts.XAxis;
    YAxis = recharts.YAxis;
    CartesianGrid = recharts.CartesianGrid;
    Tooltip = recharts.Tooltip;
    Legend = recharts.Legend;
    ResponsiveContainer = recharts.ResponsiveContainer;
  } catch {
    return null;
  }

  return (
    <div className="bg-gray-700 p-4 rounded-md">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
          <XAxis
            dataKey="date"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: '4px' }}
            labelStyle={{ color: '#d1d5db' }}
          />
          <Legend
            wrapperStyle={{ color: '#d1d5db' }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Actual Mileage"
          />
          <Line
            type="monotone"
            dataKey="expected"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Expected Mileage"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
            name="Expected Mileage"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}
            formatter={(value) => value ? value.toFixed(0) : '-'}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#3b82f6"
          name="Actual Mileage"
          dot={{ fill: '#3b82f6', r: 4 }}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expected"
          stroke="#10b981"
          name="Expected Mileage"
          strokeDasharray="5 5"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}