import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface Role {
    id: number;
    name: string;
    label: string;
}

interface CreateUserForm {
    name: string;
    email: string;
    password: string;
    role: string;
}

interface PageProps extends Record<string, any> {
    roles: Role[];
}

export default function CreateUser() {
    const { props } = usePage<PageProps>();
    const { roles } = props;

    const { data, setData, post, processing, errors } = useForm<CreateUserForm>(
        {
            name: '',
            email: '',
            password: '',
            role: roles[0]?.name ?? '',
        },
    );

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/dashboard/users', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6 p-6 font-sans antialiased">
            <Head title="Create User" />

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
                            User management
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                            Create new user
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Add a new user and assign a role.
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Back to dashboard
                    </Link>
                </div>

                <form className="space-y-6" onSubmit={submit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Name
                        </label>
                        <input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
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
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">
                            Role
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) =>
                                setData(
                                    'role',
                                    e.target.value as CreateUserForm['role'],
                                )
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Create user
                    </button>
                </form>
            </section>
        </div>
    );
}
