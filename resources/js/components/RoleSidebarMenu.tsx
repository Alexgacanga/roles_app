import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown, Shield, User as UserIcon, Users, Check } from 'lucide-react';

// Define the expected structure from your Inertia Middleware
interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            role: 'admin' | 'user';
        };
    };
    [key: string]: any;
}

export default function RoleSidebarMenu() {
    // 1. Pull the currently authenticated user's role directly from Laravel
    const { auth } = usePage<PageProps>().props;
    const currentRole = auth.user.role;

    // 2. State to handle the open/close toggle (Open by default)
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible.Root 
            open={isOpen} 
            onOpenChange={setIsOpen} 
            className="w-full space-y-1"
        >
            {/* The Main Trigger Button */}
            <Collapsible.Trigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-black">
                <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
                    <span className="group-hover:text-gray-900 transition-colors">Roles</span>
                </div>
                {/* Chevron smoothly rotates based on isOpen state */}
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </Collapsible.Trigger>

            {/* The Collapsible Content (Admin & User Options) */}
            <Collapsible.Content className="CollapsibleContent overflow-hidden">
                <div className="px-3 pt-1 pb-2 space-y-1 ml-4 border-l-2 border-gray-100">
                    
                    {/* Admin Option */}
                    <div className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all cursor-default
                        ${currentRole === 'admin' 
                            ? 'bg-black text-white shadow-sm ml-1' // Active state pops out slightly
                            : 'text-gray-500 opacity-60 ml-0'} // Inactive state is subdued
                    `}>
                        <div className="flex items-center gap-3">
                            <Shield className={`h-4 w-4 ${currentRole === 'admin' ? 'text-white' : 'text-gray-400'}`} />
                            <span>Admin</span>
                        </div>
                        {currentRole === 'admin' && <Check className="h-4 w-4" />}
                    </div>

                    {/* User Option */}
                    <div className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all cursor-default
                        ${currentRole === 'user' 
                            ? 'bg-black text-white shadow-sm ml-1'
                            : 'text-gray-500 opacity-60 ml-0'}
                    `}>
                        <div className="flex items-center gap-3">
                            <UserIcon className={`h-4 w-4 ${currentRole === 'user' ? 'text-white' : 'text-gray-400'}`} />
                            <span>User</span>
                        </div>
                        {currentRole === 'user' && <Check className="h-4 w-4" />}
                    </div>

                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    );
}