import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { dashboard } from '@/routes';

type User = {
    id: number;
    name: string;
    email: string;
    role: string; // stored as 'admin'|'user' in the DB
};

interface PageProps {
    users: User[];
    auth?: { user?: { id?: number } };
}

export default function Dashboard() {
    const { props } = usePage<PageProps>();
    const initial = (props.users || []) as User[];
    const [users, setUsers] = useState<User[]>(initial);
    const currentUserId = props.auth?.user?.id;

    const updateUserRole = (userId: number, role: string) => {
        // optimistic UI
        const previous = users;
        setUsers((current) =>
            current.map((u) => (u.id === userId ? { ...u, role } : u)),
        );

        router.patch(
            `/dashboard/users/${userId}/role`,
            { role },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (errors: any) => {
                    setUsers(previous);
                    const msg =
                        errors?.role?.[0] ||
                        errors?.message ||
                        'Unable to update role.';
                    // show a visible error to the admin
                    alert(msg);
                },
            },
        );
    };

    const adminCount = users.filter((user) => user.role === 'admin').length;
    const userCount = users.length - adminCount;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="User Roles" />

            <div className="mx-auto max-w-6xl space-y-6">
                <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                Role Management
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                                Assign roles to your team
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Use the role dropdown to switch users between
                                admin and user access. Changes are reflected
                                instantly in the interface.
                            </p>
                        </div>

                        <div className="grid w-full max-w-md grid-cols-2 gap-4 sm:grid-cols-2 lg:w-auto">
                            <div className="rounded-3xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                                <p className="text-xs tracking-[0.24em] text-slate-500 uppercase">
                                    Admins
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">
                                    {adminCount}
                                </p>
                            </div>
                            <div className="rounded-3xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
                                <p className="text-xs tracking-[0.24em] text-slate-500 uppercase">
                                    Users
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">
                                    {userCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="px-6 py-5 sm:px-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Team members
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Select a role from the dropdown for each
                                    user.
                                </p>
                            </div>
                            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                                Total users:{' '}
                                <span className="ml-2 font-semibold text-slate-900">
                                    {users.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200">
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
                                        Current role
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Assign role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition-colors hover:bg-slate-50/80"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">
                                                {user.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Team member
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    user.role === 'admin'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {user.role
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <label className="block text-sm font-medium text-slate-700">
                                                <span className="sr-only">
                                                    Assign role for {user.name}
                                                </span>
                                                <select
                                                    className="mt-1 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm transition duration-150 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                                    value={user.role}
                                                    onChange={(event) =>
                                                        updateUserRole(
                                                            user.id,
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="admin">
                                                        Admin
                                                    </option>
                                                    <option
                                                        value="user"
                                                        disabled={
                                                            user.id ===
                                                            currentUserId
                                                        }
                                                        title={
                                                            user.id ===
                                                            currentUserId
                                                                ? 'You cannot change the account you are logged in with.'
                                                                : undefined
                                                        }
                                                    >
                                                        User
                                                    </option>
                                                </select>
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'User Roles',
            href: dashboard(),
        },
    ],
};
