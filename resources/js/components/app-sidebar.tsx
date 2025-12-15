import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, Home, Minus, Plus, User, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { url } = usePage();

    const data = {
        navMain: [
            {
                title: "User Management",
                url: "#",
                icon: User,
                isVisible: true,
                items: [
                    {
                        title: "Users",
                        url: "/dashboard/users",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/users'),
                    },
                    {
                        title: "Roles",
                        url: "/dashboard/roles",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/roles'),
                    },
                    {
                        title: "Teachers",
                        url: "/dashboard/teachers",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/teachers'),
                    },
                    {
                        title: "Students",
                        url: "/dashboard/students",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/students'),
                    },
                ],
            },
            {
                title: "Classes/Grades",
                url: "#",
                icon: Users,
                isVisible: true,
                items: [
                    {
                        title: "Grades",
                        url: "/dashboard/grades",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/grades'),
                    },
                    {
                        title: "Class Sections",
                        url: "/dashboard/sections",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/sections'),
                    },
                ],
            },
            {
                title: "Academics",
                url: "#",
                icon: BookOpen,
                isVisible: true,
                items: [
                    {
                        title: "Academic Years",
                        url: "/dashboard/academic-years",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/academic-years'),
                    },
                    {
                        title: "Subjects",
                        url: "/dashboard/subjects",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/subjects'),
                    },
                    {
                        title: "Teacher Subjects",
                        url: "/dashboard/teacher-subject-assignments",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/teacher-subject-assignments'),
                    },
                    {
                        title: "Student Enrollments",
                        url: "/dashboard/student-enrollments",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/student-enrollments'),
                    },
                ],
            },
            {
                title: "Exams & Results",
                url: "#",
                icon: Folder,
                isVisible: true,
                items: [
                    {
                        title: "Exams",
                        url: "/dashboard/exams",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/exams'),
                    },
                    {
                        title: "Exam Results",
                        url: "/dashboard/exam-results",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/exam-results'),
                    },
                    {
                        title: "Published Results",
                        url: "/dashboard/published-results",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/published-results'),
                    },
                ],
            },
            {
                title: "Fees & Billing",
                url: "#",
                icon: Folder,
                isVisible: true,
                items: [
                    {
                        title: "Fee Categories",
                        url: "/dashboard/fee-categories",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/fee-categories'),
                    },
                    {
                        title: "Fee Structures",
                        url: "/dashboard/fee-structures",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/fee-structures'),
                    },
                    {
                        title: "Student Billing",
                        url: "/dashboard/student-billing",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/student-billing'),
                    },
                    {
                        title: "Payments",
                        url: "/dashboard/payments",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/payments'),
                    },
                    {
                        title: "Payment Receipts",
                        url: "/dashboard/payment-receipts",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/payment-receipts'),
                    },
                    {
                        title: "Fee Notifications",
                        url: "/dashboard/fee-notifications",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/fee-notifications'),
                    },
                ],
            },
            {
                title: "Access Control",
                url: "#",
                icon: Users,
                isVisible: true,
                items: [
                    {
                        title: "Permissions",
                        url: "/dashboard/permissions",
                        isVisible: true,
                        isActive: url.startsWith('/dashboard/permissions'),
                    },
                ],
            },
        ],
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent >
                <SidebarGroup>
                    <SidebarMenu>
                        {/* Dashboard as first item */}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={url === '/dashboard'}>
                                <Link href="/dashboard" className="flex items-center gap-2 ">
                                    <Home />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {data.navMain
                            .filter(item => item.isVisible)?.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Collapsible key={item.title} defaultOpen={item.items?.filter(it => it?.isActive)?.length > 0} className="group/collapsible">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton>
                                                    {Icon && <Icon />}
                                                    {item.title}
                                                    <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                                                    <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            {item.items?.length ? (
                                                <CollapsibleContent >
                                                    <SidebarMenuSub>
                                                        {item.items?.filter(it => it.isVisible)?.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                                                    <Link href={subItem.url}>{subItem.title}</Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            ) : null}
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            })}

                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
