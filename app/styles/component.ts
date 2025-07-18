import { tv } from "tailwind-variants"

export const style = {
  footer: {
    link: tv({
      base: "mx-2 text-cyan-600 dark:text-blue-300 hover:text-blue-600 dark:hover:text-cyan-400 visited:text-emerald-600 dark:visited:text-emerald-300",
    }),
    social: {
      link: tv({
        base: "flex text-slate-700 dark:text-slate-300 mx-2 my-0 px-2 items-center hover:transform hover:scale-110 transition-transform",
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
          "mx-auto px-auto",
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

  form: {
    container: tv({
      base: "space-y-4",
    }),
    input: tv({
      base: [
        "w-full px-3 py-2 h-10",
        "border border-slate-300 dark:border-slate-700 rounded-md shadow-sm",
        "bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      ],
      variants: {
        disabled: {
          true: "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed",
        },
      },
    }),
    select: tv({
      base: [
        "w-full px-3 py-2 h-10",
        "border border-slate-300 dark:border-slate-700 rounded-md shadow-sm",
        "bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      ],
      variants: {
        disabled: {
          true: "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed",
        },
      },
    }),
    button: tv({
      base: [
        "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium cursor-pointer",
        "text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition duration-200",
      ],
      variants: {
        disabled: {
          true: "opacity-50 cursor-not-allowed",
        },
        type: {
          green: "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
          gray: "bg-gray-300 hover:bg-gray-400 text-slate-900 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-slate-300",
          danger: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
        },
      },
    }),
    label: tv({
      base: "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2",
      variants: {
        necessary: {
          true: "after:content-['*'] after:text-red-600 after:m1-1 after:dark:text-red-400",
        },
      },
    }),
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
