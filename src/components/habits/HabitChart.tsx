"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { DailyHabitStat } from '@/types';

interface HabitChartProps {
    data: DailyHabitStat[];
    width?: number | string;
    height?: number;
}

export function HabitChart({ data, width = "100%", height = 120 }: HabitChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <div style={{ width, height }} className="relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 25, left: 25, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {/* 
                      We hide axes to keep it clean, but XAxis ensures scaling matches the grid columns 
                      Assuming the parent controls the width perfectly to match (data.length * colWidth)
                    */}
                    <XAxis
                        dataKey="date"
                        hide
                        interval={0}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                        }}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 5, fill: '#2563eb' }}
                        animationDuration={500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
