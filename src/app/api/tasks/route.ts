import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase, toSnakeCase } from '@/lib/utils/transformation';

export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch tasks with their subtasks
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    // Fetch all subtasks for these tasks
    const taskIds = tasks?.map(t => t.id) || [];

    if (taskIds.length > 0) {
        const { data: subtasks, error: subtasksError } = await supabase
            .from('subtasks')
            .select('*')
            .in('task_id', taskIds)
            .order('created_at', { ascending: true });

        if (subtasksError) {
            console.error('Error fetching subtasks:', subtasksError);
            return NextResponse.json({ error: subtasksError.message }, { status: 500 });
        }

        // Use helper for mapping
        const transformedTasks = tasks.map(task => {
            const taskWithCamelKeys = toCamelCase(task) as any;
            return {
                ...taskWithCamelKeys,
                subtasks: subtasks?.filter(st => st.task_id === task.id).map(st => toCamelCase(st)) || []
            };
        });

        return NextResponse.json(transformedTasks);
    }

    return NextResponse.json(tasks?.map(t => ({ ...(toCamelCase(t) as any), subtasks: [] })) || []);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { subtasks, ...taskData } = body;

        // Transform camelCase keys to snake_case for DB
        const dbTaskData = toSnakeCase(taskData);

        // Insert task
        const { data: task, error: taskError } = await supabase
            .from('tasks')
            .insert({
                ...(dbTaskData as any),
                user_id: user.id
            })
            .select()
            .single();

        if (taskError) {
            console.error('Error creating task:', taskError);
            return NextResponse.json({ error: taskError.message }, { status: 500 });
        }

        const transformedTask: any = toCamelCase(task);

        // Insert subtasks if provided
        if (subtasks && subtasks.length > 0) {
            const subtasksToInsert = subtasks.map((st: any) => ({
                task_id: task.id,
                title: st.title,
                completed: st.completed || false
            }));

            const { data: insertedSubtasks, error: subtasksError } = await supabase
                .from('subtasks')
                .insert(subtasksToInsert)
                .select();

            if (subtasksError) {
                console.error('Error creating subtasks:', subtasksError);
                return NextResponse.json({
                    ...transformedTask,
                    subtasks: [],
                    warning: 'Task created but subtasks failed'
                });
            }

            return NextResponse.json({
                ...transformedTask,
                subtasks: insertedSubtasks.map(st => toCamelCase(st))
            });
        }

        return NextResponse.json({ ...transformedTask, subtasks: [] });
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
