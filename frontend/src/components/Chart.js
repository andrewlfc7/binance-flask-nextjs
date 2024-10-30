// src/components/Chart.js
"use client";
import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const Chart = ({ klineData }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();

    // Process and sort data for the chart
    const processChartData = (data) => {
        const processed = data
            .map(candle => ({
                time: Math.floor(candle[0] / 1000), // Convert milliseconds to seconds
                value: parseFloat(candle[4]) // Using close price
            }))
            .sort((a, b) => a.time - b.time) // Sort by timestamp
            .filter((item, index, self) =>
                index === self.findIndex(t => t.time === item.time)
            );

        return processed;
    };

    // Chart initialization
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor: 'black',
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            grid: {
                vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
                horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
            },
            crosshair: { mode: 1 },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                autoScale: true,
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const areaSeries = chart.addAreaSeries({
            lineColor: '#2962FF',
            topColor: '#2962FF',
            bottomColor: 'rgba(41, 98, 255, 0.28)',
            lineWidth: 2,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });

        chartRef.current = chart;
        seriesRef.current = areaSeries;

        // Update chart data
        if (klineData.length > 0) {
            const chartData = processChartData(klineData);
            seriesRef.current.setData(chartData);
            chartRef.current?.timeScale().fitContent();
        }

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [klineData]);

    return (
        <div ref={chartContainerRef} className="w-full rounded-lg shadow-lg bg-white p-4" />
    );
};

export default Chart;

