export type Dictionary = {
  common: {
    signIn: string;
    getStarted: string;
    explore: string;
    contact: string;
    dashboard: string;
    catalog: string;
    learnMore: string;
    loading: string;
    emptyState: string;
    error: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
  };
  nav: {
    catalog: string;
    contact: string;
  };
};

const en: Dictionary = {
  common: {
    signIn: "Sign in",
    getStarted: "Get started",
    explore: "Explore courses",
    contact: "Contact us",
    dashboard: "Dashboard",
    catalog: "Courses",
    learnMore: "Learn more",
    loading: "Loading…",
    emptyState: "Nothing here yet.",
    error: "Something went wrong.",
  },
  home: {
    heroTitle: "Learn skills that change your career.",
    heroSubtitle: "Online and on-site training, with real certificates and rewards as you progress.",
  },
  nav: {
    catalog: "Courses",
    contact: "Contact",
  },
};

export default en;
