import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// Type for a single data point (time + any number of vital keys)
export interface ChartDataPoint {
    time: string;
    [key: string]: number | string;
}

interface LineChartProps {
    dataArray: ChartDataPoint[];
    lines: string[]; // e.g., ['heartRate'] or ['accX', 'accY', 'accZ']
    labels: string[]; // e.g., ['Heart Rate'] or ['Acc X', 'Acc Y', 'Acc Z']
    width?: number;
    height?: number;
    title?: string;
    color?: string;
    colors?: string[];
}

const COLORS = [
    'rgb(255, 99, 132)',   // red
    'rgb(54, 162, 235)',   // blue
    'rgb(255, 206, 86)',   // yellow
    'rgb(75, 192, 192)',   // green
    'rgb(153, 102, 255)',  // purple
    'rgb(255, 159, 64)',   // orange
];

const LineChart: React.FC<LineChartProps> = ({
    dataArray,
    lines,
    labels,
    width = 400,
    height = 200,
    title = '',
    color,
    colors
}) => {
    // Prepare chart.js data structure
    const chartData = {
        labels: dataArray.map(d => {
            const date = new Date(d.time);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }),
        datasets: lines.map((key, idx) => {
            const linecolor =
                lines.length === 1 && color ? color :
                    colors && colors[idx] ? colors[idx] :
                        COLORS[idx % COLORS.length];
            return {
                label: labels[idx] || key,
                data: dataArray.map(d => typeof d[key] === 'number' ? d[key] as number : null),
                borderColor: linecolor,
                backgroundColor: linecolor,
                fill: false,
                tension: 0.2,
                spanGaps: true
            };
        })
    };

    const options = {
        responsive: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: !!title, text: title }
        },
        scales: {
            y: {
                beginAtZero: false,
                // Chart.js will auto-scale based on data
            }
        }
    };

    return (
        <div style={{ width, height }}>
            <Line data={chartData} options={options} width={width} height={height} />
        </div>
    );
};

export default LineChart;
