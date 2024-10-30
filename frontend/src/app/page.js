// src/app/page.js
"use client";
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Chart from '../components/Chart';

const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
});

export default function Home() {
    const [klineData, setKlineData] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Socket.IO connection and data handling
    useEffect(() => {
        socket.on('connect', () => {
            console.log('WebSocket connected');
            setConnectionStatus('connected');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('error');
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setConnectionStatus('disconnected');
        });

        socket.on('kline_data', (data) => {
            console.log('Received kline data:', data.length);
            setKlineData(data);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off('kline_data');
            socket.close();
        };
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">BTC/USDC Market Data</h1>
            
            {/* Connection Status */}
            <div className="mb-4">
                Status: <span className={`font-bold ${
                    connectionStatus === 'connected' ? 'text-green-600' : 
                    connectionStatus === 'error' ? 'text-red-600' : 
                    'text-yellow-600'
                }`}>
                    {connectionStatus}
                </span>
            </div>

            {/* Chart */}
            <div className="mb-8">
                <div className="text-xl font-bold mb-2">Price Chart</div>
                <Chart klineData={klineData} />
            </div>

        </div>
    );
}

