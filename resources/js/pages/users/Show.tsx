import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
    due_date: string | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    tasks: Task[];
}

interface PageProps extends Record<string, any> {
    user: User;
}

export default function UserShow({}: PageProps) {
    const { props } = usePage<PageProps>();
    const { user } = props;

    const statusClasses = (status: Task['status']) => {
        if (status === 'Completed')
            return 'border-green-200 bg-green-50 text-green-700';
        if (status === 'In Progress')
            return 'border-blue-200 bg-blue-50 text-blue-700';
        return 'border-gray-200 bg-gray-50 text-gray-700';
    };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-6 font-sans antialiased">
            <Head title={`${user.name} — Profile`} />

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900">
                            {user.name}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            {user.email}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                            Role
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-slate-600 uppercase">
                            {user.role}
                        </span>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                            Task history
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                            All tasks assigned to {user.name}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/tasks"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to tasks
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Task</th>
                                <th className="px-6 py-4 font-medium">
                                    Status
                                </th>
                                <th className="px-6 py-4 font-medium">
                                    Priority
                                </th>
                                <th className="px-6 py-4 font-medium">
                                    Due date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {user.tasks.length > 0 ? (
                                user.tasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="transition-colors hover:bg-slate-50/80"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {task.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(task.status)}`}
                                            >
                                                {task.status === 'Completed' ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                ) : task.status ===
                                                  'In Progress' ? (
                                                    <Clock className="h-3.5 w-3.5" />
                                                ) : (
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                )}
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900">
                                            {task.priority}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {task.due_date || 'No date'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-sm text-slate-500"
                                    >
                                        This user has no tasks yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
