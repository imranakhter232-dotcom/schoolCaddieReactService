import { all_routes } from "../../../feature-module/router/all_routes";
const routes = all_routes;

/* ================================
   ROLE BASED FILTER FUNCTION
================================ */
const filterSidebarByRole = (menu: any[], roleId: number): any[] => {
  return menu
    .filter(item => {
      if (!item.allowedRoles) return true;
      return item.allowedRoles.includes(roleId);
    })
    .map(item => ({
      ...item,
      submenuItems: item.submenuItems
        ? filterSidebarByRole(item.submenuItems, roleId)
        : undefined,
    }))
    .filter(item => {
      if (item.submenuItems && item.submenuItems.length === 0) return false;
      return true;
    });
};

/* ================================
   ORIGINAL SIDEBAR DATA
   + allowedRoles ADDED
================================ */
const SidebarDataRaw = [
  {
    label: "MAIN",
    submenuOpen: true,
    submenuHdr: "Main",
    allowedRoles: [1, 2, 3, 4],
    submenuItems: [
      {
        label: "Dashboard",
        icon: "ti ti-layout-dashboard",
        submenu: true,
        allowedRoles: [1, 2, 3, 4],
        submenuItems: [
          {
            label: "Super Admin Dashboard",
            link: routes.superadminDashboard,
            allowedRoles: [4],
          },
          {
            label: "Admin Dashboard",
            link: routes.adminDashboard,
            allowedRoles: [1],
          },
          {
            label: "Teacher Dashboard",
            link: routes.teacherDashboard,
            allowedRoles: [2],
          },
          {
            label: "Student Dashboard",
            link: routes.parentDashboard,
            allowedRoles: [3],
          },
          {
            label: "Communication",
            link: routes.studentcommunication,
            icon: "ti ti-message",
            allowedRoles: [2, 3],
          },

           {
            label: "Attandance",
            link: routes.addAttendance,
            icon: "ti ti-pople",
            allowedRoles: [2],
          },
          {
            label: "School Profile",
            link: routes.schoolProfile,
            icon: "ti ti-building-school",
            allowedRoles: [2, 3, 4],
          },

        ],
      },
    ],
  },

  {
    label: "Peoples",
    submenuOpen: true,
    submenuHdr: "Peoples",
    allowedRoles: [1, 2, 3, 4],
    submenuItems: [
      {
        label: "Students",
        icon: "ti ti-school",
        submenu: true,
        allowedRoles: [1, 2, 3, 4],
        submenuItems: [
          {
            label: "All Students",
            link: routes.studentList,
            allowedRoles: [1, 2, 3],
          },

          {
            label: "All Students",
            link: routes.adminStudentList,
            allowedRoles: [4],
          },
        ],
      },
      {
        label: "School",
        icon: "ti ti-user-bolt",
        submenu: true,
        allowedRoles: [4],
        submenuItems: [
          {
            label: "School List",
            link: routes.adminSchoolList,
            allowedRoles: [4],
          },
        ],
      },
      {
        label: "Teachers",
        icon: "ti ti-users",
        submenu: true,
        allowedRoles: [1, 2, 4],
        submenuItems: [
          {
            label: "Teacher List",
            link: routes.teacherList,
            allowedRoles: [1, 2],
          },

          {
            label: "All Teachers",
            link: routes.adminTeacherList,
            allowedRoles: [4],
          },

          // {
          //   label: "Routine",
          //   link: routes.teachersRoutine,
          //   allowedRoles: [1, 2],
          // },
          
        ],
      },
    ],
  },

  {
    label: "Academic",
    submenuOpen: true,
    submenuHdr: "Academic",
    allowedRoles: [1],
    submenuItems: [
      // {
      //   label: "Classes",
      //   icon: "ti ti-school-bell",
      //   submenu: true,
      //   allowedRoles: [1, 2, 4],
      //   submenuItems: [
      //     {
      //       label: "All Classes",
      //       link: routes.classes,
      //       allowedRoles: [1, 2, 4],
      //     },
      //     // {
      //     //   label: "Schedule",
      //     //   link: routes.sheduleClasses,
      //     //   allowedRoles: [1, 2, 4],
      //     // },
      //   ],
      // },

      {
        label: "All Classes",
        link: routes.classes,
        icon: "ti ti-school-bell",
        allowedRoles: [1, 4],
      },

      {
        label: "Section",
        link: routes.classSection,
        icon: "ti ti-bell-school",
        allowedRoles: [1, 4],
      },
      // {
      //   label: "Class Routine",
      //   link: routes.classRoutine,
      //   icon: "ti ti-bell-school",
      //   allowedRoles: [1, 4],
      // },
      {
        label: "Subject",
        link: routes.classSubject,
        icon: "ti ti-book",
        allowedRoles: [1, 4],
      },
      {
        label: "Examinations",
        icon: "ti ti-hexagonal-prism-plus",
        submenu: true,
        allowedRoles: [1, 4],
        submenuItems: [
          { label: "Exam", link: routes.exam, allowedRoles: [1, 2] },
          {
            label: "Exam Schedule",
            link: routes.examSchedule,
            allowedRoles: [1, 4],
          },
          // {
          //   label: "Exam Results",
          //   link: routes.examResult,
          //   allowedRoles: [1, 2, 4],
          // },
        ],
      },
      {
        label: "Communication",
        link: routes.communication,
        icon: "ti ti-message",
        allowedRoles: [1],
      },
      {
        label: "School Profile",
        link: routes.schoolProfile,
        icon: "ti ti-building-school",
        allowedRoles: [1],
      },
    ],
  },
];

/* ================================
   FINAL EXPORTED SIDEBAR
   Call this function inside components so role_id is read fresh each time
================================ */
export const getSidebarData = () => {
  const roleId = Number(localStorage.getItem("role_id") || 0);
  return filterSidebarByRole(SidebarDataRaw, roleId);
};

// Keep backward compat — but prefer getSidebarData() in components
export const SidebarData = getSidebarData();
