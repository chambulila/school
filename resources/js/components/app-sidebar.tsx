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
import { BookOpen, Calendar, ChevronDown, ChevronRight, Folder, Home, Minus, Plus, Settings, User, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { can, canAny } from '@/hooks/usePermission';

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
                title: "Classes/Grades",
                url: "#",
                icon: Users,
                isVisible: canAny(['view-grades', 'view-sections']),
                items: [
                    {
                        title: "Grades",
                        url: "/dashboard/grades",
                        isVisible: can('view-grades'),
                        isActive: checkIsActive('/dashboard/grades'),
                    },
                    {
                        title: "Class Sections",
                        url: "/dashboard/sections",
                        isVisible: can('view-sections'),
                        isActive: checkIsActive('/dashboard/sections'),
                    },
                ],
            },
            {
                title: "User Management",
                url: "#",
                icon: User,
                isVisible: canAny(['view-users', 'view-teachers', 'view-students']),
                items: [
                    {
                        title: "Users",
                        url: "/dashboard/users",
                        isVisible: can('view-users'),
                        isActive: checkIsActive('/dashboard/users'),
                    },
                    {
                        title: "Teachers",
                        url: "/dashboard/teachers",
                        isVisible: can('view-teachers'),
                        isActive: checkIsActive('/dashboard/teachers'),
                    },
                    {
                        title: "Students",
                        url: "/dashboard/students",
                        isVisible: can('view-students'),
                        isActive: checkIsActive('/dashboard/students'),
                    },
                ],
            },
            {
                title: "Academics",
                url: "#",
                icon: BookOpen,
                isVisible: canAny(['view-academic-years', 'view-subjects', 'view-teacher-subjects', 'view-student-enrollments']),
                items: [
                    {
                        title: "Academic Years",
                        url: "/dashboard/academic-years",
                        isVisible: can('view-academic-years'),
                        isActive: checkIsActive('/dashboard/academic-years'),
                    },
                    {
                        title: "Subjects",
                        url: "/dashboard/subjects",
                        isVisible: can('view-subjects'),
                        isActive: checkIsActive('/dashboard/subjects'),
                    },
                    {
                        title: "Teacher Subjects",
                        url: "/dashboard/teacher-subject-assignments",
                        isVisible: can('view-teacher-subjects'),
                        isActive: checkIsActive('/dashboard/teacher-subject-assignments'),
                    },
                    {
                        title: "Student Enrollments",
                        url: "/dashboard/student-enrollments",
                        isVisible: can('view-student-enrollments'),
                        isActive: checkIsActive('/dashboard/student-enrollments'),
                    },
                ],
            },
            {
                title: "Exams & Results",
                url: "#",
                icon: Folder,
                isVisible: canAny(['view-exams', 'enroll-student-to-exam', 'view-exam-results', 'view-published-results']),
                items: [
                    {
                        title: "Exams",
                        url: "/dashboard/exams",
                        isVisible: can('view-exams'),
                        isActive: checkIsActive('/dashboard/exams'),
                    },
                    {
                        title: "Exam Enrollments",
                        url: "/dashboard/exams/enrollments/create",
                        isVisible: can('enroll-student-to-exam'),
                        isActive: checkIsActive('/dashboard/exams/enrollments/create'),
                    },
                    {
                        title: "Exam Results",
                        url: "/dashboard/exams/enrollments/results",
                        isVisible: can('view-exam-results'),
                        isActive: checkIsActive('/dashboard/exams/enrollments/results'),
                    },
                    {
                        title: "Published Results",
                        url: "/dashboard/published-results",
                        isVisible: can('view-published-results'),
                        isActive: checkIsActive('/dashboard/published-results'),
                    },
                ],
            },
            {
                title: "Fees & Billing",
                url: "#",
                icon: Folder,
                isVisible: canAny(['view-fee-categories', 'view-fee-structures', 'view-student-billings', 'view-payments', 'view-payment-receipts', 'view-payment-reports', 'view-fee-notifications']),
                items: [
                    {
                        title: "Fee Categories",
                        url: "/dashboard/fee-categories",
                        isVisible: can('view-fee-categories'),
                        isActive: checkIsActive('/dashboard/fee-categories'),
                    },
                    {
                        title: "Fee Structures",
                        url: "/dashboard/fee-structures",
                        isVisible: can('view-fee-structures'),
                        isActive: checkIsActive('/dashboard/fee-structures'),
                    },
                    {
                        title: "Student Billing",
                        url: "/dashboard/student-billing",
                        isVisible: can('view-student-billings'),
                        isActive: checkIsActive('/dashboard/student-billing'),
                    },
                    {
                        title: "Payments",
                        url: "/dashboard/payments",
                        isVisible: can('view-payments'),
                        isActive: checkIsActive('/dashboard/payments'),
                    },
                    {
                        title: "Payment Receipts",
                        url: "/dashboard/payment-receipts",
                        isVisible: can('view-payment-receipts'),
                        isActive: checkIsActive('/dashboard/payment-receipts'),
                    },
                    {
                        title: "Payment Reports",
                        url: "/dashboard/reports/payments",
                        isVisible: can('view-payment-reports'),
                        isActive: checkIsActive('/dashboard/reports/payments'),
                    },
                    {
                        title: "Fee Notifications",
                        url: "/dashboard/fee-notifications",
                        isVisible: can('view-fee-notifications'),
                        isActive: checkIsActive('/dashboard/fee-notifications'),
                    },
                ],
            },
            // for attendances
            {
                title: "Attendances",
                url: "#",
                icon: Calendar,
                isVisible: canAny(['view-teachers-attendances', 'view-students-attendances']),
                items: [
                    {
                        title: "Teachers Attendances",
                        url: "/dashboard/attendances/teachers",
                        isVisible: can('view-teachers-attendances'),
                        isActive: checkIsActive('/dashboard/attendances/teachers'),
                    },
                    {
                        title: "Students Attendances",
                        url: "/dashboard/attendances/students",
                        isVisible: can('view-students-attendances'),
                        isActive: checkIsActive('/dashboard/attendances/students'),
                    },
                ],
            },
            {
                title: "Access Control",
                url: "#",
                icon: Users,
                isVisible: canAny(['view-roles', 'manage-permissions', 'manage-roles', 'view-audit-logs']),
                items: [
                    {
                        title: "Roles",
                        url: "/dashboard/roles",
                        isVisible: can('view-roles'),
                        isActive: checkIsActive('/dashboard/roles'),
                    },
                    {
                        title: "Permissions",
                        url: "/dashboard/permissions",
                        isVisible: can('manage-permissions'),
                        isActive: checkIsActive('/dashboard/permissions'),
                    },
                    {
                        title: "Assign Roles",
                        url: "/dashboard/users",
                        isVisible: can('manage-roles'),
                        isActive: checkIsActive('/dashboard/users'),
                    },
                    {
                        title: "Audit Logs",
                        url: "/dashboard/audit-logs",
                        isVisible: can('view-audit-logs'),
                        isActive: checkIsActive('/dashboard/audit-logs'),
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
