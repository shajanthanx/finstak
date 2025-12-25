import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase, toSnakeCase } from '@/lib/utils/transformation';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { subtasks, ...otherData } = body;

        // Transform camelCase to snake_case for database
        const taskUpdates = toSnakeCase(otherData) as any;

        // If there are other fields to update, do the update
        let task;
        if (Object.keys(taskUpdates).length > 0) {
            const { data, error: taskError } = await supabase
                .from('tasks')
                .update(taskUpdates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (taskError) {
                console.error('Error updating task:', taskError);
                return NextResponse.json({ error: taskError.message }, { status: 500 });
            }
            task = data;
        } else {
            // Just fetch the task if only subtasks (or nothing) are provided
            const { data, error: fetchError } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (fetchError) {
                console.error('Error fetching task:', fetchError);
                return NextResponse.json({ error: fetchError.message }, { status: 500 });
            }
            task = data;
        }

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Handle subtasks if provided
        let finalSubtasks = [];

        if (subtasks) {
            // Delete existing subtasks
            await supabase
                .from('subtasks')
                .delete()
                .eq('task_id', id);

            // Insert new subtasks
            if (subtasks.length > 0) {
                const subtasksToInsert = subtasks.map((st: any) => ({
                    task_id: parseInt(id),
                    title: st.title,
                    completed: st.completed || false
                }));

                const { data: insertedSubtasks, error: subtasksError } = await supabase
                    .from('subtasks')
                    .insert(subtasksToInsert)
                    .select();

                if (subtasksError) {
                    console.error('Error updating subtasks:', subtasksError);
                }
                finalSubtasks = insertedSubtasks || [];
            }
        } else {
            // Fetch existing subtasks if not provided in update
            const { data: existingSubtasks } = await supabase
                .from('subtasks')
                .select('*')
                .eq('task_id', id);
            finalSubtasks = existingSubtasks || [];
        }

        // Return transformed task and subtasks
        const transformedTask: any = toCamelCase(task);
        return NextResponse.json({
            ...transformedTask,
            subtasks: finalSubtasks.map(st => toCamelCase(st))
        });
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete task (subtasks will be deleted automatically via CASCADE)
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
