import { useState, useEffect, FormEvent, useRef } from 'react';
import { router, Link, useForm } from '@inertiajs/react';
import {
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Edit2,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';

// --- TypeScript Interfaces ---

type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
type TaskPriority = 'Low' | 'Medium' | 'High';

interface Task {
    id: number;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null;
    user: {
        id: number;
        name: string;
    } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

interface PageProps {
    tasks: PaginatedData<Task>;
    filters: {
        search?: string;
    };
    auth: {
        user: any;
        permissions: {
            update_task: boolean;
            delete_task: boolean;
        };
    };
}

// --- Component ---

export default function TaskDashboard({ tasks, filters, auth }: PageProps) {
    // Permission Checks
    const canEdit = auth.permissions.update_task;
    const canDelete = auth.permissions.delete_task;
    const hasActions = canEdit || canDelete;

    // Search State & Refs
    const [searchQuery, setSearchQuery] = useState<string>(
        filters.search || '',
    );
    const previousSearch = useRef(searchQuery);

    // Modal & Edit State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

    // Inertia Form Hook
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            title: '',
            status: 'Pending' as TaskStatus,
            priority: 'Medium' as TaskPriority,
            due_date: '',
        });

    // Handle Search with Debouncing & React Strict Mode Fix
    useEffect(() => {
        if (previousSearch.current === searchQuery) {
            return;
        }

        previousSearch.current = searchQuery;

        const delaySearch = setTimeout(() => {
            router.get(
                '/tasks',
                { search: searchQuery },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    // Modal Triggers
    const openCreateModal = () => {
        setEditingTaskId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTaskId(task.id);
        setData({
            title: task.title,
            status: task.status,
            priority: task.priority,
            due_date: task.due_date || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    // Handle Form Submit (Create & Edit)
    const submitTask = (e: FormEvent) => {
        e.preventDefault();

        if (editingTaskId) {
            put(`/tasks/${editingTaskId}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/tasks', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    // Handle Delete
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/tasks/${id}`);
        }
    };

    // Helper for Status styling
    const StatusIcon = ({ status }: { status: TaskStatus }) => {
        if (status === 'Completed')
            return <CheckCircle2 className="h-3 w-3 text-green-600" />;
        if (status === 'In Progress')
            return <Clock className="h-3 w-3 text-blue-600" />;
        return <AlertCircle className="h-3 w-3 text-gray-500" />;
    };

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 p-6 font-sans antialiased">
            {/* Header & Controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                        Tasks
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage your daily operations.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="w-64 rounded-md border border-gray-200 py-2 pr-4 pl-9 text-sm transition-all outline-none focus:ring-2 focus:ring-black"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
                    >
                        <Plus className="h-4 w-4" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Elegant Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50/50 font-medium text-gray-500">
                        <tr>
                            <th className="px-4 py-3">Task Name</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Priority</th>
                            <th className="px-4 py-3">Due Date</th>
                            {hasActions && (
                                <th className="px-4 py-3 text-right">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tasks.data.map((task) => (
                            <tr
                                key={task.id}
                                className="group transition-colors hover:bg-gray-50/50"
                            >
                                <td className="px-4 py-2.5 font-medium text-gray-900">
                                    {task.title}
                                </td>
                                <td className="px-4 py-2.5 text-gray-700">
                                    {task.user ? (
                                        <Link
                                            href={`/users/${task.user.id}`}
                                            className="font-medium text-slate-900 hover:text-black"
                                        >
                                            {task.user.name}
                                        </Link>
                                    ) : (
                                        'Unknown'
                                    )}
                                </td>
                                <td className="px-4 py-2.5">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${task.status === 'Completed' ? 'border-green-200 bg-green-50 text-green-700' : ''} ${task.status === 'In Progress' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''} ${task.status === 'Pending' ? 'border-gray-200 bg-gray-50 text-gray-700' : ''} `}
                                    >
                                        <StatusIcon status={task.status} />
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <span
                                        className={
                                            task.priority === 'High'
                                                ? 'font-medium text-red-600'
                                                : 'text-gray-600'
                                        }
                                    >
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 text-gray-500">
                                    {task.due_date ?? 'No Date'}
                                </td>

                                {hasActions && (
                                    <td className="px-4 py-2.5 text-right">
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger className="rounded-md p-1.5 text-gray-400 opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:bg-gray-100">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Portal>
                                                <DropdownMenu.Content className="z-50 min-w-[160px] rounded-md border border-gray-100 bg-white p-1 shadow-lg">
                                                    {canEdit && (
                                                        <DropdownMenu.Item
                                                            onSelect={() =>
                                                                openEditModal(
                                                                    task,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 outline-none hover:bg-gray-50"
                                                        >
                                                            <Edit2 className="h-4 w-4" />{' '}
                                                            Edit
                                                        </DropdownMenu.Item>
                                                    )}

                                                    {canDelete && (
                                                        <>
                                                            {canEdit && (
                                                                <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                                                            )}
                                                            <DropdownMenu.Item
                                                                onSelect={() =>
                                                                    handleDelete(
                                                                        task.id,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 outline-none hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />{' '}
                                                                Delete
                                                            </DropdownMenu.Item>
                                                        </>
                                                    )}
                                                </DropdownMenu.Content>
                                            </DropdownMenu.Portal>
                                        </DropdownMenu.Root>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tasks.data.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-500">
                        No tasks found. Try adjusting your search or create a
                        new one.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <p>
                    Showing{' '}
                    <span className="font-medium text-gray-900">
                        {tasks.from || 0}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-gray-900">
                        {tasks.to || 0}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-gray-900">
                        {tasks.total}
                    </span>{' '}
                    results
                </p>
                <div className="flex gap-1">
                    {tasks.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className={`rounded border px-3 py-1 transition-colors ${
                                    link.active
                                        ? 'border-black bg-black font-medium text-white'
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={index}
                                className="cursor-not-allowed rounded border border-gray-200 bg-gray-50 px-3 py-1 text-gray-400 opacity-50"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </div>
            </div>

            {/* Shared Create / Edit Modal */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" />
                    <Dialog.Content className="fixed top-[50%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border border-gray-100 bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                {editingTaskId
                                    ? 'Edit Task'
                                    : 'Create New Task'}
                            </Dialog.Title>
                            <Dialog.Close className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </Dialog.Close>
                        </div>

                        <form onSubmit={submitTask} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-black focus:outline-none sm:text-sm"
                                    placeholder="e.g., Update marketing copy"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) =>
                                            setData(
                                                'status',
                                                e.target.value as TaskStatus,
                                            )
                                        }
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:ring-2 focus:ring-black focus:outline-none sm:text-sm"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">
                                            In Progress
                                        </option>
                                        <option value="Completed">
                                            Completed
                                        </option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Priority
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(e) =>
                                            setData(
                                                'priority',
                                                e.target.value as TaskPriority,
                                            )
                                        }
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:ring-2 focus:ring-black focus:outline-none sm:text-sm"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    {errors.priority && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.priority}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) =>
                                        setData('due_date', e.target.value)
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-black focus:outline-none sm:text-sm"
                                />
                                {errors.due_date && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.due_date}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Dialog.Close asChild>
                                    <button
                                        type="button"
                                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </Dialog.Close>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Saving...'
                                        : editingTaskId
                                          ? 'Save Changes'
                                          : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
