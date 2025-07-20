import { tv } from "tailwind-variants"

export const style = {
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
        base: "h-6 rounded-full my-2 mx-1",
      }),
    },
  },

  form: {
    container: tv({
      base: "space-y-4 gap-2",
      variants: {
        vertical: {
          true: "grid grid-cols-3 items-center",
        },
      },
    }),
    input: tv({
      base: [
        "w-full px-3 py-2 h-10 my-1",
        "border border-slate-300 dark:border-slate-700 rounded-md shadow-sm",
        "bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-transparent",
      ],
      variants: {
        disabled: {
          true: "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed",
        },
        error: {
          true: "ring-red-400 dark:ring-red-600",
        },
      },
    }),
    select: tv({
      base: [
        "w-full px-3 py-2 h-10 my-1",
        "border border-slate-300 dark:border-slate-700 rounded-md shadow-sm",
        "bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      ],
      variants: {
        disabled: {
          true: "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 cursor-not-allowed",
        },
      },
    }),
    button: tv({
      base: [
        "w-full my-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-md font-medium cursor-pointer",
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
      base: "block font-medium text-slate-700 dark:text-slate-300 my-1",
      variants: {
        necessary: {
          true: "after:content-['*'] after:text-red-600 after:m1-1 after:dark:text-red-400",
        },
      },
    }),
  },

  card: {
    container: tv({
      base: "bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700",
    }),
  },

  button: tv({
    base: "py-2 px-4 rounded-md font-medium transition-colors duration-200 shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800",
    variants: {
      disabled: {
        true: "opacity-50 cursor-not-allowed",
      },
      type: {
        primary: "", // ベーススタイルが primary に相当
        secondary:
          "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-800 dark:text-white",
        danger: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      },
    },
  }),

  text: {
    title: tv({
      base: "text-3xl mb-4 font-bold text-slate-800 dark:text-slate-200",
    }),
    sectionTitle: tv({
      base: "text-xl font-bold mb-4 text-slate-800 dark:text-slate-200",
    }),
    subtitle: tv({
      base: "text-lg font-semibold text-slate-700 dark:text-slate-300",
    }),
    body: tv({}),
    link: tv({
      base: " text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors duration-200",
    }),
    highlight: tv({}),
    error: tv({
      base: "text-red-500 p-2 rounded-md bg-red-200 dark:bg-red-600/50 dark:text-red-400",
    }),
    success: tv({
      base: "text-green-500 p-2 rounded-md bg-green-200 dark:bg-green-500/50 dark:text-green-400",
    }),
    warning: tv({
      base: "text-amber-500 p-2 rounded-md bg-amber-200 dark:bg-amber-600/50 dark:text-amber-300",
    }),
    info: tv({
      base: ["text-sm text-slate-800 dark:text-slate-300"],
    }),
    code: tv({
      base: "bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm font-mono text-slate-900 dark:text-slate-200",
    }),
  },
}
