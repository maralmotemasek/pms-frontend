export const ORGANIZATION_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
};


export const PROJECT_ROLES = {
  PROJECT_MANAGER: "PROJECT_MANAGER",
  TEAM_LEAD: "TEAM_LEAD",
  MEMBER: "MEMBER",
};


/*
  فعلاً User لاگین‌شده را Mock می‌کنیم.

  بعداً این اطلاعات از /auth/me
  و APIهای Organization می‌آید.
*/
export const currentUser = {
  id: 1,
  fullName: "علیرضا نوری",

  /*
    برای تست Create Project
    فعلاً OWNER در نظر گرفته شده.
  */
  organizationRole:
    ORGANIZATION_ROLES.OWNER,
};


/*
  اعضای Organization

  فعلاً در Create Project استفاده نمی‌شوند.
  بعداً برای بخش Members به کارمان می‌آیند.
*/
export const organizationMembers = [
  {
    id: 1,
    fullName: "علیرضا نوری",
  },

  {
    id: 2,
    fullName: "سهراب سپهری",
  },

  {
    id: 3,
    fullName: "رویا رضایی",
  },

  {
    id: 4,
    fullName: "آرش کمالگیر",
  },

  {
    id: 5,
    fullName: "مهرداد بهرامی",
  },
];


/*
  ساختار Mock پروژه‌ها را شبیه مدل جدید نگه می‌داریم:

  Project
      ↓
  ProjectMember
      ↓
  Role

  یعنی دیگر managerId و memberIds جدا نداریم.
*/
export const mockProjects = [
  {
    id: 1,

    title:
      "سیستم یکپارچه‌سازی انبارداری",

    description:
      "طراحی و توسعه سیستم یکپارچه برای مدیریت انبار، موجودی کالا، ورود و خروج محصولات و گزارش‌های مدیریتی.",

    status: "in-progress",

    statusLabel:
      "در حال انجام",

    progress: 80,

    budget: "850000000",

    startDate:
      "1404/06/15",

    endDate:
      "1404/10/30",

    members: [
      {
        userId: 2,
        fullName:
          "سهراب سپهری",

        role:
          PROJECT_ROLES.PROJECT_MANAGER,
      },

      {
        userId: 1,
        fullName:
          "علیرضا نوری",

        role:
          PROJECT_ROLES.MEMBER,
      },

      {
        userId: 3,
        fullName:
          "رویا رضایی",

        role:
          PROJECT_ROLES.TEAM_LEAD,
      },
    ],

    tasks: [
      {
        id: 1,
        title:
          "طراحی ساختار دیتابیس",
        status:
          "انجام شده",
      },

      {
        id: 2,
        title:
          "طراحی رابط کاربری",
        status:
          "در حال انجام",
      },

      {
        id: 3,
        title:
          "پیاده‌سازی داشبورد",
        status:
          "برای انجام",
      },
    ],

    documents: [
      {
        id: 1,
        name:
          "project-requirements.pdf",

        size: 1258291,

        type:
          "application/pdf",

        isExisting: true,
      },

      {
        id: 2,
        name:
          "warehouse-flow.xlsx",

        size: 743210,

        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        isExisting: true,
      },
    ],
  },


  {
    id: 2,

    title:
      "بازطراحی پنل مشتریان تجارت الکترونیک",

    description:
      "بازطراحی کامل پنل مشتریان با تمرکز بر تجربه کاربری، سرعت، دسترسی ساده‌تر و طراحی واکنش‌گرا.",

    status: "delayed",

    statusLabel:
      "به تعویق افتاده",

    progress: 35,

    budget: "620000000",

    startDate:
      "1404/07/10",

    endDate:
      "1404/11/15",

    members: [
      {
        userId: 1,
        fullName:
          "علیرضا نوری",

        role:
          PROJECT_ROLES.PROJECT_MANAGER,
      },

      {
        userId: 3,
        fullName:
          "رویا رضایی",

        role:
          PROJECT_ROLES.TEAM_LEAD,
      },

      {
        userId: 4,
        fullName:
          "آرش کمالگیر",

        role:
          PROJECT_ROLES.MEMBER,
      },
    ],

    tasks: [
      {
        id: 4,
        title:
          "تحلیل رابط کاربری فعلی",
        status:
          "انجام شده",
      },

      {
        id: 5,
        title:
          "طراحی وایرفریم صفحات",
        status:
          "در حال انجام",
      },

      {
        id: 6,
        title:
          "پیاده‌سازی صفحه پروفایل",
        status:
          "برای انجام",
      },
    ],

    documents: [
      {
        id: 3,

        name:
          "customer-panel-analysis.pdf",

        size: 950120,

        type:
          "application/pdf",

        isExisting: true,
      },
    ],
  },


  {
    id: 3,

    title:
      "پورتال جدید خدمات پس از فروش",

    description:
      "طراحی پورتال جدید خدمات پس از فروش برای ثبت درخواست، پیگیری وضعیت و مدیریت ارتباط با مشتریان.",

    status: "review",

    statusLabel:
      "در انتظار تایید",

    progress: 95,

    budget: "540000000",

    startDate:
      "1404/05/01",

    endDate:
      "1404/09/20",

    members: [
      {
        userId: 3,
        fullName:
          "رویا رضایی",

        role:
          PROJECT_ROLES.PROJECT_MANAGER,
      },

      {
        userId: 1,
        fullName:
          "علیرضا نوری",

        role:
          PROJECT_ROLES.TEAM_LEAD,
      },

      {
        userId: 5,
        fullName:
          "مهرداد بهرامی",

        role:
          PROJECT_ROLES.MEMBER,
      },
    ],

    tasks: [
      {
        id: 7,
        title:
          "تست نهایی سیستم",
        status:
          "در حال انجام",
      },

      {
        id: 8,
        title:
          "تهیه مستندات",
        status:
          "در انتظار تایید",
      },
    ],

    documents: [],
  },


  /*
    علیرضا عضو این پروژه نیست.

    بنابراین در «پروژه‌های من»
    نباید آن را ببیند.
  */
  {
    id: 4,

    title:
      "توسعه نرم‌افزار موبایل سازمان",

    description:
      "توسعه نسخه موبایل سامانه سازمانی.",

    status: "completed",

    statusLabel:
      "تکمیل شده",

    progress: 100,

    budget: "930000000",

    startDate:
      "1404/04/18",

    endDate:
      "1404/08/25",

    members: [
      {
        userId: 4,
        fullName:
          "آرش کمالگیر",

        role:
          PROJECT_ROLES.PROJECT_MANAGER,
      },

      {
        userId: 5,
        fullName:
          "مهرداد بهرامی",

        role:
          PROJECT_ROLES.MEMBER,
      },
    ],

    tasks: [],

    documents: [],
  },
];