import { tv } from "tailwind-variants"

export const style = {
  footer: {
    link: tv({
      base: "text-cyan-600 dark:text-blue-300 hover:text-blue-600 dark:hover:text-cyan-400 visited:text-emerald-600 dark:visited:text-emerald-300",
    }),
    social: {
      link: tv({
        base: "flex text-slate-700 dark:text-slate-300 mx-2 my-0 items-center hover:transform hover:scale-110 transition-transform",
      }),
      text: tv({
        base: "text-slate-700 dark:text-slate-300 text-sm font-bold mr-2 hidden md:block",
      }),
    },
  },

  header: {
    div: tv({
      base: "p-2 rounded-lg select-none mb-1",
    }),
    link: tv({
      base: [
        "p-2 my-2 rounded-lg",
        "bg-slate-300/30 dark:bg-slate-700/30",
        "text-slate-800 dark:text-slate-200",
        "hover:bg-slate-400/60 dark:hover:bg-slate-600/60",
      ],
    }),

    navigation: {
      block: tv({
        base: [
          "flex gap-2 items-center",
          "rounded-lg backdrop-blur-lg",
          "bg-slate-300/30 dark:bg-slate-700/30",
        ],
      }),
      link: tv({
        base: [
          "text-slate-800 dark:text-slate-200",
          "bg-slate-400/60 dark:bg-slate-600/60",
          "hover:bg-slate-400/30 dark:hover:bg-slate-600/30",
          "rounded-lg px-4 py-2",
          "hover:scale-105 transition-transform",
        ],
        variants: {
          active: {
            true: ["border-2 border-violet-400 dark:border-violet-600"],
            false: ["border-2 border-transparent hover:border-teal-300 dark:hover:border-teal-600"],
          },
        },
      }),
    },
    clerk: {
      name: tv({
        base: [
          "rounded-lg select-none mb-0 flex items-center relative",
          "font-bold",
          "hover:bg-slate-400/60 dark:hover:bg-slate-600/60",
        ],
      }),
      icon: tv({
        base: "h-6 rounded-full m-2",
      }),
    },
  },

  modal: {
    content: tv({
      base: [
        "bg-slate-300 dark:bg-slate-700",
        "shadow-lg shadow-green-500/25 dark:shadow-emerald-400/20",
        "fixed p-7 w-3/4 sm:w-5/12 md:w-2/5 lg:w-1/4 h-11/12 transition-all duration-300 ease-out",
        "will-change-transform overflow-y-auto",
        "pointer-events-auto overscroll-contain",
        "hover:shadow-xl hover:shadow-green-500/30 dark:hover:shadow-emerald-400/25",
      ],
      variants: {
        position: {
          left: "left-0 -translate-x-full rounded-r-3xl",
          right: "right-0 translate-x-full rounded-l-3xl",
        },
      },
    }),
    bg: tv({
      base: "fixed inset-0 z-50 hidden w-full h-full bg-black/35 opacity-0 transition-opacity duration-300 ease-in-out backdrop-blur-sm items-center",
    }),
    button: tv({
      base: [
        "bg-slate-700/40",
        "rounded-2xl p-4 w-6 h-6 mx-3 text-base cursor-pointer flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "outline-1 outline-slate-700/20",
        "hover:bg-slate-700/60 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg",
        "active:translate-y-0 active:scale-95",
      ],
    }),
  },

  form: {
    container: tv({
      base: "grid grid-cols-3 gap-4 items-center",
    }),
    input: tv({
      base: [
        "col-span-2 px-3 py-2",
        "bg-slate-100 dark:bg-slate-800",
        "border border-slate-400 dark:border-slate-600 rounded-md",
      ],
      variants: {
        disable: {
          true: "animate-pulse bg-slate-200 dark:bg-slate-700 cursor-not-allowed",
        },
      },
    }),
    button: tv({
      base: [
        "col-span-3 py-2 px-4 rounded-md transition-colors",
        "bg-emerald-300 dark:bg-emerald-700 text-slate-800 dark:text-slate-200",
        "hover:bg-emerald-400 dark:hover:bg-emerald-600",
        "disabled:bg-slate-200 dark:disabled:bg-slate-700",
      ],
      variants: {
        type: {
          reset: "bg-red-300 dark:bg-red-700 hover:bg-red-400 dark:hover:bg-red-600",
        },
        span: {
          single: "col-span-1",
          double: "col-span-2",
        },
      },
    }),
    feedback: tv({}),
    recent: {
      container: tv({}),
      title: tv({}),
      body: tv({}),
    },
  },

  table: {
    container: tv({
      base: "overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700",
    }),
    table: tv({
      base: "min-w-full divide-y divide-slate-200 dark:divide-slate-700",
    }),
    thead: {
      container: tv({}),
      tr: tv({}),
      th: tv({
        base: [
          "px-4 py-3 text-left text-slate-700 dark:text-slate-300 uppercase tracking-wider",
          "bg-slate-200 dark:bg-slate-800",
        ],
      }),
    },
    tbody: {
      container: tv({}),
      tr: tv({
        base: ["hover:bg-slate-50/40 dark:hover:bg-slate-800/40", "transition-colors duration-200"],
      }),
      td: tv({
        base: ["px-4 py-4 whitespace-nowrap text-slate-500 dark:text-slate-300"],
      }),
    },
  },

  sort: {
    button: tv({
      base: [
        "px-4 py-2 rounded-md my-2 mx-1",
        "bg-slate-200 dark:bg-slate-800",
        "text-slate-700 dark:text-slate-300",
        "hover:bg-slate-300 dark:hover:bg-slate-700",
        "transition-colors duration-200",
      ],
      variants: {
        active: {
          true: "bg-violet-400 dark:bg-violet-600 text-white hover:bg-violet-300 dark:hover:bg-violet-500",
        },
      },
    }),
  },
  pagenation: {
    button: tv({
      base: [],
      variants: {
        type: {
          next: [
            "px-4 py-2 rounded-md my-2 mx-1",
            "bg-slate-200 dark:bg-slate-800",
            "text-slate-700 dark:text-slate-300",
            "hover:bg-slate-300 dark:hover:bg-slate-700",
            "transition-colors duration-200",
          ],
          previous: [
            "px-4 py-2 rounded-md my-2 mx-1",
            "bg-slate-200 dark:bg-slate-800",
            "text-slate-700 dark:text-slate-300",
            "hover:bg-slate-300 dark:hover:bg-slate-700",
            "transition-colors duration-200",
          ],
        },
        disabled: {
          true: "opacity-50 cursor-not-allowed",
        },
      },
    }),
  },
  text: {
    title: tv({
      base: "text-3xl mb-4 font-bold text-slate-800 dark:text-slate-200",
    }),
    subtitle: tv({}),
    body: tv({}),
    link: tv({
      base: "text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200",
    }),
    highlight: tv({}),
    error: tv({}),
    success: tv({}),
    warning: tv({}),
    info: tv({}),
    code: tv({}),
    necessary: tv({
      base: "text-red-500 dark:text-red-400 text-xs align-super pl-0",
    }),
  },
}
