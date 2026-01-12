"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
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
                <AreaChart data={data} margin={{ top: 10, right: 25, left: 25, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />

                    {/* Invisible X Axis to maintain scale */}
                    <XAxis dataKey="date" hide interval={0} />
                    <YAxis hide domain={[0, 100]} />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            padding: '8px 12px',
                        }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}
                        labelStyle={{ display: 'none' }}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        formatter={(value: number) => [`${value}%`, 'Completion']}
                    />

                    <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="3 3" />

                    <Area
                        type="monotone"
                        dataKey="percentage"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fill="url(#colorPercentage)"
                        dot={{ r: 0, fill: '#4f46e5', strokeWidth: 0 }}
                        activeDot={{ r: 4, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div >
    );
}
