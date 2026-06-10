import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function MileageChart({ readings, car }) {
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

  if (!car?.annualLimit || chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">📊 Mileage Trend</h3>
      <div className="bg-gray-750 p-4 rounded-lg border border-gray-700">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
              labelStyle={{ color: '#d1d5db', fontWeight: 'bold' }}
            />
            <Legend
              wrapperStyle={{ color: '#d1d5db', fontSize: '13px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Actual Mileage"
            />
            <Line
              type="monotone"
              dataKey="expected"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              name="Expected Mileage"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}