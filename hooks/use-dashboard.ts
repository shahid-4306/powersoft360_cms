import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertCircle,
  Users,
  Plus,
  UserCheck,
  CheckCircle,
  BarChart3,
  UserCog,
} from "lucide-react";

export interface UserSession {
  id: string;
  username: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface Task {
  _id: string;
  company: { name: string };
  working: string;
  status: string;
  finalStatus?: string;
  approved?: boolean;
  unposted?: boolean;
  createdAt: string;
  assignedTo?: {
    id: string;
    username: string;
    name: string;
    role: {
      name: string;
    };
  };
  assignedToId?: string;
  contact?: any;
  code?: string;
  developer_status?: string;
  developer_remarks?: string;
  createdBy?: string;
}

export interface Complaint {
  _id: string;
  complaintNumber: string;
  company: {
    companyName: string;
    companyId: string;
    city: string;
    address: string;
    companyRepresentative: string;
    phoneNumber: string;
    support: string;
  };
  softwareType: string;
  contactPerson: string;
  contactPhone: string;
  complaintRemarks: string;
  status: "registered" | "in-progress" | "resolved" | "closed";
  submittedByUserId: string;
  submitterEmail?: string;
  assignedTo?: {
    id: string;
    username: string;
    name: string;
    role: {
      name: string;
    };
  };
  developer_status?: string;
  createdAt: string;
  updatedAt: string;
  resolvedDate?: string;
  completionApproved?: boolean;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  onHoldTasks: number;
  approvedTasks: number;
  unpostedTasks: number;
  userTotalTasks: number;
  userCompletedTasks: number;
  userPendingTasks: number;
  totalComplaints: number;
  registeredComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  closedComplaints: number;
  userTotalComplaints: number;
  userInProgressComplaints: number;
  userResolvedComplaints: number;
  userClosedComplaints: number;
}

// Global prefetch cache
const prefetchedRoutes = new Set<string>();

export interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  iconBg: string;
  iconColor: string;
  permission: string;
}

export function useDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    onHoldTasks: 0,
    approvedTasks: 0,
    unpostedTasks: 0,
    userTotalTasks: 0,
    userCompletedTasks: 0,
    userPendingTasks: 0,
    totalComplaints: 0,
    registeredComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    closedComplaints: 0,
    userTotalComplaints: 0,
    userInProgressComplaints: 0,
    userResolvedComplaints: 0,
    userClosedComplaints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user: sessionUser, isLoading: authLoading, logout } = useAuth();
  const permissionCache = useRef<Map<string, boolean>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);

  // Prefetch routes immediately on mount
  useEffect(() => {
    [
      "/dashboard/tasks/create",
      "/dashboard/tasks/assign",
      "/dashboard/tasks/all",
      "/dashboard/complaints/create",
      "/dashboard/complaints/assign",
      "/dashboard/complaints/all",
      "/dashboard/reports",
    ].forEach((route) => {
      if (!prefetchedRoutes.has(route)) {
        router.prefetch(route);
        prefetchedRoutes.add(route);
      }
    });
  }, [router]);

  // User session handling — sourced from AuthContext (httpOnly cookie session)
  // instead of reading localStorage directly.
  useEffect(() => {
    // Wait for the session check to resolve before deciding anything;
    // otherwise we'd redirect to /login on every first render.
    if (authLoading) return;

    if (!sessionUser) {
      toast({
        title: "Session Expired",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    if (!sessionUser?.role?.permissions) {
      toast({
        title: "Invalid Session",
        description: "User role or permissions missing. Please log in again.",
        variant: "destructive",
      });
      logout();
      router.push("/login");
      return;
    }

    setUser(sessionUser);
  }, [sessionUser, authLoading, router, toast, logout]);

  // Permission checks
  const isAdminOrManager = useMemo(() => {
    if (!user) return false;
    return (
      user.role.permissions.includes("tasks.view.all") ||
      user.role.name.toLowerCase().includes("admin") ||
      user.role.name.toLowerCase().includes("manager")
    );
  }, [user]);

  const isTaskCreator = useMemo(() => {
    if (!user) return false;
    return (
      user.role.permissions.includes("tasks.create") ||
      user.role.permissions.includes("tasks.update")
    );
  }, [user]);

  const canViewComplaints = useMemo(() => {
    if (!user) return false;

    console.log("🔐 Checking complaint permissions for:", {
      username: user.username,
      role: user.role.name,
      permissions: user.role.permissions,
      hasComplaintsView: user.role.permissions.includes("complaints.view"),
      isAdminOrManager,
      roleIncludesDeveloper: user.role.name.toLowerCase().includes("developer"),
    });

    // Always allow admin/manager
    if (isAdminOrManager) {
      console.log("✅ Admin/Manager can view complaints");
      return true;
    }

    // Check for explicit complaint permission
    if (user.role.permissions.includes("complaints.view")) {
      console.log("✅ User has complaints.view permission");
      return true;
    }

    // Allow developers to view complaints even without explicit permission
    const isDeveloper = user.role.name.toLowerCase().includes("developer");
    if (isDeveloper) {
      console.log("✅ User is a developer, allowing complaint view");
      return true;
    }

    // Check for any complaint-related permissions
    const hasAnyComplaintPermission = user.role.permissions.some(
      (permission) =>
        permission.includes("complaint") || permission.includes("complaints"),
    );

    if (hasAnyComplaintPermission) {
      console.log("✅ User has complaint-related permission");
      return true;
    }

    console.log("❌ User cannot view complaints");
    return false;
  }, [user, isAdminOrManager]);

  // Process tasks
  const processTasks = useCallback(
    (tasksData: Task[]) => {
      const sortedTasks = tasksData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setTasks(sortedTasks);

      // Filter tasks based on user role
      let userSpecificTasks: Task[] = [];

      if (isAdminOrManager) {
        userSpecificTasks = sortedTasks;
      } else if (isTaskCreator) {
        userSpecificTasks = sortedTasks.filter(
          (task) => task.createdBy === user?.id,
        );
      } else {
        userSpecificTasks = sortedTasks.filter((task) => {
          return (
            (task.assignedTo && task.assignedTo.id === user?.id) ||
            task.assignedToId === user?.id
          );
        });
      }

      setUserTasks(userSpecificTasks);

      // Calculate stats
      const total = sortedTasks.length;
      const completed = sortedTasks.filter(
        (t) => t.finalStatus === "done",
      ).length;
      const pending = sortedTasks.filter((t) => t.status === "pending").length;
      const onHold = sortedTasks.filter(
        (t) => t.finalStatus === "on-hold",
      ).length;
      const approved = sortedTasks.filter((t) => t.approved).length;
      const unposted = sortedTasks.filter((t) => t.unposted).length;

      // User-specific stats
      let userTotal = 0;
      let userCompleted = 0;
      let userPending = 0;

      if (isAdminOrManager) {
        userTotal = sortedTasks.length;
        userCompleted = sortedTasks.filter(
          (t) => t.finalStatus === "done",
        ).length;
        userPending = sortedTasks.filter((t) => t.status === "pending").length;
      } else if (isTaskCreator) {
        userTotal = userSpecificTasks.length;
        userCompleted = userSpecificTasks.filter(
          (t) => t.finalStatus === "done",
        ).length;
        userPending = userSpecificTasks.filter(
          (t) => t.status === "pending",
        ).length;
      } else {
        userTotal = userSpecificTasks.length;
        userCompleted = userSpecificTasks.filter(
          (t) => t.developer_status === "done",
        ).length;
        userPending = userSpecificTasks.filter(
          (t) => t.developer_status === "pending",
        ).length;
      }

      setStats((prev) => ({
        ...prev,
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        onHoldTasks: onHold,
        approvedTasks: approved,
        unpostedTasks: unposted,
        userTotalTasks: userTotal,
        userCompletedTasks: userCompleted,
        userPendingTasks: userPending,
      }));
    },
    [user, isAdminOrManager, isTaskCreator],
  );

  // Process complaints
  const processComplaints = useCallback(
    (complaintsData: Complaint[]) => {
      const sortedComplaints = complaintsData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      console.log("📊 Total complaints received:", sortedComplaints.length);
      console.log("👤 Current user:", {
        id: user?.id,
        username: user?.username,
        role: user?.role.name,
        isAdminOrManager,
      });

      setComplaints(sortedComplaints);

      // Filter complaints based on user role
      let userSpecificComplaints: Complaint[] = [];

      if (isAdminOrManager) {
        // Admin/Manager sees all complaints
        userSpecificComplaints = sortedComplaints;
        console.log("👑 Admin/Manager mode: Showing ALL complaints");
      } else {
        // For non-admins, show complaints assigned to them
        console.log("🔍 Filtering complaints for user:", user?.id);

        // Log a few sample complaints to check structure
        sortedComplaints.slice(0, 3).forEach((complaint, index) => {
          console.log(`Sample complaint ${index + 1}:`, {
            id: complaint._id,
            complaintNumber: complaint.complaintNumber,
            assignedTo: complaint.assignedTo,
            status: complaint.status,
            assignedToId: complaint.assignedTo?.id,
            currentUserId: user?.id,
            match: complaint.assignedTo?.id === user?.id,
          });
        });

        userSpecificComplaints = sortedComplaints.filter((complaint) => {
          const isAssigned =
            complaint.assignedTo && complaint.assignedTo.id === user?.id;
          return isAssigned;
        });

        console.log(
          "✅ Complaints filtered for user:",
          userSpecificComplaints.length,
        );
      }

      setUserComplaints(userSpecificComplaints);

      // Calculate complaint stats
      const total = sortedComplaints.length;
      const registered = sortedComplaints.filter(
        (c) => c.status === "registered",
      ).length;
      const inProgress = sortedComplaints.filter(
        (c) => c.status === "in-progress",
      ).length;
      const resolved = sortedComplaints.filter(
        (c) => c.status === "resolved",
      ).length;
      const closed = sortedComplaints.filter(
        (c) => c.status === "closed",
      ).length;

      // For developers, calculate their specific complaint stats
      let userTotal = userSpecificComplaints.length;
      let userInProgress = userSpecificComplaints.filter(
        (c) => c.status === "in-progress",
      ).length;
      let userResolved = userSpecificComplaints.filter(
        (c) => c.status === "resolved",
      ).length;
      let userClosed = userSpecificComplaints.filter(
        (c) => c.status === "closed",
      ).length;

      console.log("📈 Complaint statistics:");
      console.log("   Total complaints:", total);
      console.log("   User-specific complaints:", userTotal);
      console.log("   User in-progress:", userInProgress);
      console.log("   User resolved:", userResolved);
      console.log("   User closed:", userClosed);

      setStats((prev) => ({
        ...prev,
        totalComplaints: total,
        registeredComplaints: registered,
        inProgressComplaints: inProgress,
        resolvedComplaints: resolved,
        closedComplaints: closed,
        userTotalComplaints: userTotal,
        userInProgressComplaints: userInProgress,
        userResolvedComplaints: userResolved,
        userClosedComplaints: userClosed,
      }));
    },
    [user, isAdminOrManager],
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch tasks
      const tasksResponse = await fetch("/api/tasks?sort=createdAt:desc");
      if (!tasksResponse.ok) throw new Error("Failed to fetch tasks");
      const tasksData: Task[] = await tasksResponse.json();
      processTasks(tasksData);

      // Fetch complaints
      const complaintsResponse = await fetch("/api/online-complaints");
      if (complaintsResponse.ok) {
        const complaintsData: Complaint[] = await complaintsResponse.json();
        processComplaints(complaintsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, processTasks, processComplaints]);

  // Set up SSE connection
  useEffect(() => {
    if (!user) return;

    fetchData();

    // Set up SSE connection for tasks
    const eventSource = new EventSource("/api/tasks/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        if (event.data.trim() === ": heartbeat") return;

        const tasksData: Task[] = JSON.parse(event.data);
        processTasks(tasksData);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setTimeout(() => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = new EventSource("/api/tasks/stream");
        }
      }, 5000);
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, fetchData, processTasks]);

  // Optimized permission check
  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;

      if (permissionCache.current.has(permission)) {
        return permissionCache.current.get(permission) as boolean;
      }

      const hasPerm = user.role.permissions.includes(permission);
      permissionCache.current.set(permission, hasPerm);
      return hasPerm;
    },
    [user],
  );

  // Quick actions with prefetch
  const getQuickActions = useMemo(() => {
    const actions: QuickAction[] = [
      {
        title: "Create New Task",
        description: "Add a new task to your workflow",
        icon: Plus,
        href: "/dashboard/tasks/create",
        color: "from-emerald-500 to-emerald-600",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        permission: "tasks.create",
      },
      {
        title: "Assign Tasks",
        description: "Review and approve pending tasks",
        icon: UserCheck,
        href: "/dashboard/tasks/assign",
        color: "from-purple-500 to-purple-600",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        permission: "tasks.assign",
      },
      {
        title: "Create Complaint",
        description: "Register a new customer complaint",
        icon: AlertCircle,
        href: "/dashboard/complaints/create",
        color: "from-red-500 to-red-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        permission: "complaints.create",
      },
      {
        title: "Assign Complaints",
        description: "Assign complaints to developers",
        icon: Users,
        href: "/dashboard/complaints/assign",
        color: "from-orange-500 to-orange-600",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        permission: "complaints.assign",
      },
      {
        title: "Manage Tasks",
        description: "Update task status and progress",
        icon: CheckCircle,
        href: "/dashboard/tasks/all",
        color: "from-indigo-500 to-indigo-600",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        permission: "tasks.manage",
      },
      {
        title: "View Reports",
        description: "Analyze productivity and insights",
        icon: BarChart3,
        href: "/dashboard/reports",
        color: "from-pink-500 to-pink-600",
        iconBg: "bg-pink-100",
        iconColor: "text-pink-600",
        permission: "reports.view",
      },
      {
        title: "User Management",
        description: "Manage users and permissions",
        icon: UserCog,
        href: "/dashboard/users",
        color: "from-amber-500 to-amber-600",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        permission: "users.manage",
      },
    ];

    const filtered = actions.filter((action) =>
      hasPermission(action.permission),
    );

    // Prefetch all allowed routes
    filtered.forEach((action) => {
      if (!prefetchedRoutes.has(action.href)) {
        router.prefetch(action.href);
        prefetchedRoutes.add(action.href);
      }
    });

    return filtered;
  }, [hasPermission, router]);

  // Progress rates
  const taskCompletionRate = useMemo(
    () =>
      isAdminOrManager
        ? stats.totalTasks > 0
          ? (stats.completedTasks / stats.totalTasks) * 100
          : 0
        : stats.userTotalTasks > 0
          ? (stats.userCompletedTasks / stats.userTotalTasks) * 100
          : 0,
    [stats, isAdminOrManager],
  );

  const complaintResolutionRate = useMemo(
    () =>
      stats.totalComplaints > 0
        ? ((stats.resolvedComplaints + stats.closedComplaints) /
            stats.totalComplaints) *
          100
        : 0,
    [stats],
  );

  const taskApprovalRate = useMemo(
    () =>
      stats.totalTasks > 0 ? (stats.approvedTasks / stats.totalTasks) * 100 : 0,
    [stats],
  );

  return {
    tasks,
    complaints,
    userTasks,
    userComplaints,
    stats,
    isLoading: isLoading || authLoading,
    user,
    isAdminOrManager,
    isTaskCreator,
    canViewComplaints,
    taskCompletionRate,
    complaintResolutionRate,
    taskApprovalRate,
    getQuickActions,
    hasPermission,
    prefetchedRoutes,
  };
}
