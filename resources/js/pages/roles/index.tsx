import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

type Permission = {
    id: number;
    name: string;
    label: string;
    group: string;
};

type Role = {
    id: number;
    name: string;
    label: string;
    is_super_admin: boolean;
    permissions: Permission[];
};

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
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
    roles: Role[];
    permissions: Record<string, Permission[]>;
    users: PaginatedData<User>;
    filters: {
        search?: string;
    };
}

export default function RolesIndex() {
    const { props } = usePage<PageProps>();
    const { roles, permissions, users, filters } = props;

    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        label: '',
        permission_ids: [] as number[],
    });

    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const {
        data: editData,
        setData: setEditData,
        patch: patchEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        label: '',
        permission_ids: [] as number[],
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/roles',
                { search: searchQuery },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/roles', {
            preserveState: true,
            onSuccess: () => reset(),
        });
    };

    const togglePermission = (permissionId: number) => {
        const current = data.permission_ids;
        setData(
            'permission_ids',
            current.includes(permissionId)
                ? current.filter((id) => id !== permissionId)
                : [...current, permissionId],
        );
    };

    const assignRole = (user: User, roleId: number) => {
        if (!Number.isInteger(roleId) || roleId <= 0) {
            return;
        }

        router.post(
            `/roles/users/${user.id}/assign`,
            {
                role_ids: [roleId],
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const deleteUser = (user: User) => {
        if (!confirm(`Delete ${user.name}?`)) {
            return;
        }

        router.delete(`/dashboard/users/${user.id}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const startEditingRole = (role: Role) => {
        setEditingRole(role);
        setEditData('name', role.name);
        setEditData('label', role.label);
        setEditData(
            'permission_ids',
            role.permissions.map((permission) => permission.id),
        );
    };

    const cancelEditingRole = () => {
        setEditingRole(null);
        resetEdit();
    };

    const submitEdit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingRole) {
            return;
        }

        patchEdit(`/roles/${editingRole.id}`, {
            preserveState: true,
            onSuccess: () => {
                cancelEditingRole();
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Role Management" />

            <div className="mx-auto max-w-6xl space-y-6">
                <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                Super Admin Console
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                                Manage roles and users
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                Create roles, assign permissions, manage users,
                                and update role assignments from one page.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/users/create"
                            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create new user
                        </Link>
                    </div>
                </header>

                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                Role creation
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                Create a new role
                            </h2>
                        </div>

                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Role name
                                </label>
                                <input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">
                                    Label
                                </label>
                                <input
                                    value={data.label}
                                    onChange={(e) =>
                                        setData('label', e.target.value)
                                    }
                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                />
                                {errors.label && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.label}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Permissions
                                </p>
                                <div className="mt-3 space-y-3">
                                    {Object.entries(permissions).map(
                                        ([group, perms]) => (
                                            <div key={group}>
                                                <p className="mb-2 text-sm font-semibold text-slate-500 uppercase">
                                                    {group}
                                                </p>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {perms
                                                        .filter(
                                                            (permission) =>
                                                                permission.name !==
                                                                    'view_user' &&
                                                                permission.name !==
                                                                    'view_task',
                                                        )
                                                        .map((permission) => (
                                                            <label
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.permission_ids.includes(
                                                                        permission.id,
                                                                    )}
                                                                    onChange={() =>
                                                                        togglePermission(
                                                                            permission.id,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                                                                />
                                                                <span>
                                                                    {
                                                                        permission.label
                                                                    }
                                                                </span>
                                                            </label>
                                                        ))}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                                {errors.permission_ids && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.permission_ids}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Create role
                            </button>
                        </form>
                    </section>

                    {editingRole && (
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                        Update role
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                        Edit {editingRole.label}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Update the role name, label, and
                                        assigned permissions.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={cancelEditingRole}
                                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={submitEdit}>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Role name
                                    </label>
                                    <input
                                        value={editData.name}
                                        onChange={(e) =>
                                            setEditData('name', e.target.value)
                                        }
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                    />
                                    {editErrors.name && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {editErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700">
                                        Label
                                    </label>
                                    <input
                                        value={editData.label}
                                        onChange={(e) =>
                                            setEditData('label', e.target.value)
                                        }
                                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                    />
                                    {editErrors.label && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {editErrors.label}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-slate-700">
                                        Permissions
                                    </p>
                                    <div className="mt-3 space-y-3">
                                        {Object.entries(permissions).map(
                                            ([group, perms]) => (
                                                <div key={group}>
                                                    <p className="mb-2 text-sm font-semibold text-slate-500 uppercase">
                                                        {group}
                                                    </p>
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        {perms
                                                            .filter(
                                                                (permission) =>
                                                                    permission.name !==
                                                                        'view_user' &&
                                                                    permission.name !==
                                                                        'view_task',
                                                            )
                                                            .map(
                                                                (
                                                                    permission,
                                                                ) => (
                                                                    <label
                                                                        key={
                                                                            permission.id
                                                                        }
                                                                        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={editData.permission_ids.includes(
                                                                                permission.id,
                                                                            )}
                                                                            onChange={() => {
                                                                                const current =
                                                                                    editData.permission_ids;
                                                                                setEditData(
                                                                                    'permission_ids',
                                                                                    current.includes(
                                                                                        permission.id,
                                                                                    )
                                                                                        ? current.filter(
                                                                                              (
                                                                                                  id,
                                                                                              ) =>
                                                                                                  id !==
                                                                                                  permission.id,
                                                                                          )
                                                                                        : [
                                                                                              ...current,
                                                                                              permission.id,
                                                                                          ],
                                                                                );
                                                                            }}
                                                                            className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                                                                        />
                                                                        <span>
                                                                            {
                                                                                permission.label
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                ),
                                                            )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    {editErrors.permission_ids && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {editErrors.permission_ids}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Save role changes
                                </button>
                            </form>
                        </section>
                    )}

                    <section className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                        Roles
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                        Existing roles
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                                <table className="min-w-full text-left text-sm text-slate-700">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">
                                                Role
                                            </th>
                                            <th className="px-6 py-4 font-medium">
                                                Label
                                            </th>
                                            <th className="px-6 py-4 font-medium">
                                                Permissions
                                            </th>
                                            <th className="px-6 py-4 font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {roles
                                            .filter(
                                                (role) => !role.is_super_admin,
                                            )
                                            .map((role) => (
                                                <tr
                                                    key={role.id}
                                                    className="transition-colors hover:bg-slate-50/80"
                                                >
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {role.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">
                                                        {role.label}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-700">
                                                        {role.permissions
                                                            .map(
                                                                (permission) =>
                                                                    permission.label,
                                                            )
                                                            .join(', ')}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    startEditingRole(
                                                                        role,
                                                                    )
                                                                }
                                                                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                                            >
                                                                Edit
                                                            </button>
                                                            {!role.is_super_admin && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (
                                                                            !confirm(
                                                                                `Delete role ${role.label}?`,
                                                                            )
                                                                        ) {
                                                                            return;
                                                                        }
                                                                        router.delete(
                                                                            `/roles/${role.id}`,
                                                                            {
                                                                                preserveState: true,
                                                                                preserveScroll: true,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                                        Users
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                                        Assign roles and manage accounts
                                    </h2>
                                </div>
                                <div className="relative w-full max-w-sm">
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
                                                Assigned role
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
                                                <td className="px-6 py-4 text-slate-900">
                                                    <Link
                                                        href={`/users/${user.id}`}
                                                        className="text-slate-900 hover:text-black"
                                                    >
                                                        {user.name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    <Link
                                                        href={`/users/${user.id}`}
                                                        className="text-slate-600 hover:text-slate-900"
                                                    >
                                                        {user.email}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="text-sm font-medium text-slate-900">
                                                            {roles.find(
                                                                (role) =>
                                                                    role.name ===
                                                                    user.role,
                                                            )?.label ??
                                                                'No active role'}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <select
                                                                value={
                                                                    roles.find(
                                                                        (
                                                                            role,
                                                                        ) =>
                                                                            role.name ===
                                                                            user.role,
                                                                    )?.id ?? ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    assignRole(
                                                                        user,
                                                                        Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                    )
                                                                }
                                                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                                                            >
                                                                <option
                                                                    value=""
                                                                    disabled
                                                                >
                                                                    Select role
                                                                </option>
                                                                {roles
                                                                    .filter(
                                                                        (
                                                                            role,
                                                                        ) =>
                                                                            !role.is_super_admin,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            role,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    role.id
                                                                                }
                                                                                value={
                                                                                    role.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    role.label
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/dashboard/users/${user.id}/edit`,
                                                                )
                                                            }
                                                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                                        >
                                                            <Edit2 className="inline-block h-3.5 w-3.5" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteUser(user)
                                                            }
                                                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                                                        >
                                                            <Trash2 className="inline-block h-3.5 w-3.5" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                                className={`rounded border px-3 py-1 transition-colors ${link.active ? 'border-black bg-black font-medium text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
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
        </div>
    );
}
