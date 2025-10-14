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
    Legend,
    Chart,
} from 'chart.js';
import streamingPlugin from 'chartjs-plugin-streaming';
import 'chartjs-adapter-date-fns';

ChartJS.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    streamingPlugin
);


export interface ChartDataPoint {
    time: string;
    [key: string]: number | string;
}

interface LineChartProps {
    dataArray: ChartDataPoint[];
    lines: string[]; 
    labels: string[];
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

    function getLatestValueForLine() {
        if (!dataArray || dataArray.length === 0) return null;
        const latest = dataArray[dataArray.length - 1]; 
        const key = lines[0]; 
        return typeof latest[key] === 'number' ? latest[key] : null;
    }

    const chartData = {
        datasets: [
            {
                label: labels[0] || lines[0],
                borderColor: color || COLORS[0],
                data: []
            }
        ]
    };


    const options = {
        scales: {
            x: {
                type: "realtime" as "realtime",
                realtime: {
                    duration: 20000,    // Show last 20 seconds
                    refresh: 1000,      // Update every second
                    delay: 1000,        // 1s display delay for smooth animation
                    onRefresh: (chart: Chart) => {
                        const latestValue = getLatestValueForLine();
                        if (typeof latestValue === "number") {
                            chart.data.datasets.forEach(dataset => {
                                dataset.data.push({
                                    x: Date.now(),
                                    y: latestValue
                                });
                            });
                        }
                    }

                }
            },
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Live Streaming Chart' }
        }
    } as const;


    return (
        <Line data={chartData} options={options} height={200} width={400} />
    );
};

export default LineChart;
