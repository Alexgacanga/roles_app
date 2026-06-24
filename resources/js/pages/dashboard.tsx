import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
};

interface PageProps extends Record<string, any> {
    users: PaginatedData<User>;
    filters: {
        search?: string;
    };
    auth?: { user?: { id?: number } };
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const users = props.users;
    const currentUserId = props.auth?.user?.id;
    const [searchQuery, setSearchQuery] = useState<string>(
        props.filters.search || '',
    );
    const previousSearch = useRef(searchQuery);

    const startEdit = (user: User) => {
        router.visit(`/dashboard/users/${user.id}/edit`);
    };

    useEffect(() => {
        if (previousSearch.current === searchQuery) {
            return;
        }

        previousSearch.current = searchQuery;

        const timeout = setTimeout(() => {
            router.get(
                '/dashboard',
                { search: searchQuery },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleDelete = (user: User) => {
        if (user.id === currentUserId) {
            return alert(
                'You cannot delete the account you are logged in with.',
            );
        }

        if (!confirm(`Delete ${user.name}?`)) {
            return;
        }

        router.delete(`/dashboard/users/${user.id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="User Management" />

            <div className="mx-auto max-w-6xl space-y-6">
                <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                Super Admin Console
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                                Manage users and roles
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Create new accounts, assign roles, and manage
                                existing users from one place.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/users/create"
                            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                        >
                            Create new user
                        </Link>
                    </div>
                </header>

                <section className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                    User directory
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                    All users
                                </h2>
                            </div>
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-700">
                                    {users.total} users
                                </div>
                                <div className="relative mx-auto w-full max-w-sm">
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        placeholder="Search users..."
                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                            <table className="min-w-full text-left text-sm text-slate-700">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">
                                            Name
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors hover:bg-slate-50/80"
                                        >
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/users/${user.id}`}
                                                    className="font-medium text-slate-900 transition-colors hover:text-black"
                                                >
                                                    {user.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <Link
                                                    href={`/users/${user.id}`}
                                                    className="transition-colors hover:text-slate-900"
                                                >
                                                    {user.email}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                        user.role === 'admin'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : user.role ===
                                                                'manager'
                                                              ? 'bg-indigo-100 text-indigo-700'
                                                              : 'bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {user.role
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu.Root>
                                                    <DropdownMenu.Trigger className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:ring-2 focus:ring-black/10 focus:outline-none">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </DropdownMenu.Trigger>
                                                    <DropdownMenu.Portal>
                                                        <DropdownMenu.Content className="z-50 min-w-[160px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                                            <DropdownMenu.Item
                                                                onSelect={() =>
                                                                    startEdit(
                                                                        user,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                                Edit
                                                            </DropdownMenu.Item>
                                                            <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                                                            <DropdownMenu.Item
                                                                onSelect={() =>
                                                                    handleDelete(
                                                                        user,
                                                                    )
                                                                }
                                                                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
                                                                disabled={
                                                                    user.id ===
                                                                    currentUserId
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete
                                                            </DropdownMenu.Item>
                                                        </DropdownMenu.Content>
                                                    </DropdownMenu.Portal>
                                                </DropdownMenu.Root>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {users.data.length === 0 && (
                                <div className="py-12 text-center text-sm text-slate-500">
                                    No users found.
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                            <p>
                                Showing{' '}
                                <span className="font-medium text-slate-900">
                                    {users.from || 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium text-slate-900">
                                    {users.to || 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium text-slate-900">
                                    {users.total}
                                </span>{' '}
                                users
                            </p>
                            <div className="flex gap-1">
                                {users.links.map((link, index) =>
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`rounded border px-3 py-1 transition-colors ${
                                                link.active
                                                    ? 'border-black bg-black font-medium text-white'
                                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="cursor-not-allowed rounded border border-slate-200 bg-slate-50 px-3 py-1 text-slate-400 opacity-50"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: '/dashboard',
        },
    ],
};
