import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase } from '@/lib/utils/transformation';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
        return NextResponse.json({ error: 'Missing startDate or endDate' }, { status: 400 });
    }

    // 1. Fetch relevant habits (active during the period)
    // A habit is relevant if it started before the end of the period 
    // AND (wasn't archived OR was archived after the start of the period)
    const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .lte('start_date', endDate)
        .or(`archived_at.is.null,archived_at.gt.${startDate}`);

    if (habitsError) {
        console.error('Error fetching habits:', habitsError);
        return NextResponse.json({ error: habitsError.message }, { status: 500 });
    }

    // 2. Fetch logs for the period
    const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

    if (logsError) {
        console.error('Error fetching logs:', logsError);
        return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    // 3. Process Data
    // Create a map of logs: habitId -> date -> value
    const logsMap: Record<number, Record<string, number>> = {};
    logs?.forEach(log => {
        if (!logsMap[log.habit_id]) logsMap[log.habit_id] = {};
        logsMap[log.habit_id][log.date] = log.completed_value;
    });

    // Generate daily stats
    const dailyStats = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];

        // Find active habits for this specific date
        const activeHabits = habits.filter(h => {
            const started = h.start_date <= dateStr;
            const notArchived = !h.archived_at || new Date(h.archived_at).toISOString().split('T')[0] > dateStr;
            return started && notArchived;
        });

        const totalHabits = activeHabits.length;
        let completedCount = 0;

        activeHabits.forEach(h => {
            const logValue = logsMap[h.id]?.[dateStr] || 0;
            if (logValue >= h.goal_target) {
                completedCount++;
            }
        });

        const percentage = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

        dailyStats.push({
            date: dateStr,
            totalHabits,
            completedHabits: completedCount,
            percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
        dailyStats,
        logs: logsMap,
        habits: toCamelCase(habits)
    });
}
