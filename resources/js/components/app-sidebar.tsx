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
import { BookOpen, ChevronDown, ChevronRight, Folder, Home, Minus, Plus, Settings, User, Users } from 'lucide-react';
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
    const { url, props } = usePage();

    const checkIsActive = (href: string) => {
        return url === href || url.startsWith(href + '/') || url.startsWith(href + '?');
    };

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
                        isActive: checkIsActive('/dashboard/users'),
                    },
                    {
                        title: "Roles",
                        url: "/dashboard/roles",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/roles'),
                    },
                    {
                        title: "Teachers",
                        url: "/dashboard/teachers",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/teachers'),
                    },
                    {
                        title: "Students",
                        url: "/dashboard/students",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/students'),
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
                        isActive: checkIsActive('/dashboard/grades'),
                    },
                    {
                        title: "Class Sections",
                        url: "/dashboard/sections",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/sections'),
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
                        isActive: checkIsActive('/dashboard/academic-years'),
                    },
                    {
                        title: "Subjects",
                        url: "/dashboard/subjects",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/subjects'),
                    },
                    {
                        title: "Teacher Subjects",
                        url: "/dashboard/teacher-subject-assignments",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/teacher-subject-assignments'),
                    },
                    {
                        title: "Student Enrollments",
                        url: "/dashboard/student-enrollments",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/student-enrollments'),
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
                        isActive: checkIsActive('/dashboard/exams'),
                    },
                    {
                        title: "Exam Enrollments",
                        // url: "/dashboard/exam-results",
                        url: "/dashboard/exams/enrollments/create",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/exams/enrollments/create'),
                    },
                    {
                        title: "Exam Results",
                        url: "/dashboard/exams/enrollments/results",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/exams/enrollments/results'),
                    },
                    {
                        title: "Published Results",
                        url: "/dashboard/published-results",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/published-results'),
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
                        isActive: checkIsActive('/dashboard/fee-categories'),
                    },
                    {
                        title: "Fee Structures",
                        url: "/dashboard/fee-structures",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/fee-structures'),
                    },
                    {
                        title: "Student Billing",
                        url: "/dashboard/student-billing",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/student-billing'),
                    },
                    {
                        title: "Payments",
                        url: "/dashboard/payments",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/payments'),
                    },
                    {
                        title: "Payment Receipts",
                        url: "/dashboard/payment-receipts",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/payment-receipts'),
                    },
                    {
                        title: "Payment Reports",
                        url: "/dashboard/reports/payments",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/reports/payments'),
                    },
                    {
                        title: "Fee Notifications",
                        url: "/dashboard/fee-notifications",
                        isVisible: true,
                        isActive: checkIsActive('/dashboard/fee-notifications'),
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
                        isActive: checkIsActive('/dashboard/permissions'),
                    },
                ],
            },
        ],
    }

    return (
        <Sidebar style={{ backgroundColor: `${props?.settings?.theme_color}` }} collapsible="icon" variant="inset">
            <SidebarHeader style={{ backgroundColor: `${props?.settings?.theme_color}` }}>
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

            <SidebarContent style={{ backgroundColor: `${props?.settings?.theme_color}` }} >
                <SidebarGroup>
                    <SidebarMenu>
                        {/* Dashboard as first item */}
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-white" asChild isActive={url === '/dashboard' || url.startsWith('/dashboard?')}>
                                <Link href="/dashboard" className="flex items-center gap-2 ">
                                    <Home />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {data.navMain
                            .filter(item => item.isVisible)?.map((item) => {
                                const Icon = item.icon;
                                const isGroupActive = item.items?.some(it => it?.isActive);

                                return (
                                    <Collapsible
                                        key={item.title + (isGroupActive ? '-active' : '')}
                                        defaultOpen={isGroupActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton isActive={isGroupActive} className="text-white mb-1">
                                                    {Icon && <Icon />}
                                                    {item.title}
                                                    <ChevronRight className="ml-auto group-data-[state=open]/collapsible:hidden" />
                                                    <ChevronDown className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            {item.items?.length ? (
                                                <CollapsibleContent >
                                                    <SidebarMenuSub className=' space-y-1'>
                                                        {item.items?.filter(it => it.isVisible)?.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={subItem.isActive} className="text-white">
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

            <SidebarFooter style={{ backgroundColor: `${props?.settings?.theme_color}` }}>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
