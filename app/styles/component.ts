import { tv } from "tailwind-variants"

export const style = {
  header: {
    div: tv({ base: "mb-1 rounded-lg p-2 select-none" }),
    link: tv({
      base: [
        "my-2 rounded-lg p-2",
        "bg-slate-300/30 dark:bg-slate-700/30",
        "text-slate-800 dark:text-slate-200",
        "hover:bg-slate-400/60 dark:hover:bg-slate-600/60",
      ],
    }),

    navigation: {
      block: tv({
        base: [
          "flex items-center gap-2",
          "px-auto mx-auto",
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
          "transition-transform hover:scale-105",
        ],
        variants: {
          active: {
            true: ["border-2 border-violet-400 dark:border-violet-600"],
            false: [
              "border-2 border-transparent hover:border-teal-300 dark:hover:border-teal-600",
            ],
          },
        },
      }),
    },

    clerk: {
      name: tv({
        base: [
          "relative mb-0 flex items-center rounded-lg select-none",
          "font-bold",
          "hover:bg-slate-400/60 dark:hover:bg-slate-600/60",
        ],
      }),
      icon: tv({ base: "mx-1 my-2 h-6 rounded-full" }),
    },
  },

  form: {
    container: tv({
      base: "gap-2 space-y-4",
      variants: { vertical: { true: "grid grid-cols-3 items-center" } },
    }),
    input: tv({
      base: [
        "my-1 h-10 w-full px-3 py-2",
        "rounded-md border border-slate-300 shadow-sm dark:border-slate-700",
        "bg-white text-slate-900 dark:bg-slate-700 dark:text-white",
        "focus:border-transparent focus:bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:dark:bg-slate-900 disabled:dark:text-slate-400",
      ],
      variants: { error: { true: "ring-red-400 dark:ring-red-600" } },
    }),
    select: tv({
      base: [
        "my-1 h-10 w-full px-3 py-2",
        "rounded-md border border-slate-300 shadow-sm dark:border-slate-700",
        "bg-white text-slate-900 dark:bg-slate-700 dark:text-white",
        "focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:dark:bg-slate-900 disabled:dark:text-slate-400",
      ],
    }),
    button: tv({
      base: [
        "text-md my-1 flex w-full cursor-pointer items-center justify-center rounded-md border border-transparent px-4 py-3 font-medium shadow-sm",
        "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
        "transition duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-800",
        "disabled:cursor-not-allowed disabled:opacity-50",
      ],
      variants: {
        type: {
          green:
            "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
          gray: "bg-gray-300 text-slate-900 hover:bg-gray-400 dark:bg-gray-600 dark:text-slate-300 dark:hover:bg-gray-700",
          danger: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
        },
      },
    }),
    label: tv({
      base: "my-1 block font-medium text-slate-700 dark:text-slate-300",
      variants: {
        necessary: {
          true: "after:m1-1 after:text-red-600 after:content-['*'] after:dark:text-red-400",
        },
      },
    }),
  },

  label: {
    required: tv({
      base: "after:m1-1 after:text-red-600 after:content-['*'] after:dark:text-red-400",
    }),
  },

  card: {
    container: tv({
      base: "rounded-lg border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-800",
    }),
  },

  button: tv({
    base: [
      "rounded-md px-4 py-2 font-medium transition-colors",
      "bg-blue-600 text-white shadow-sm duration-200",
      "hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      "focus:ring-2 focus:ring-offset-2 focus:outline-none",
      "focus:ring-blue-500 dark:focus:ring-offset-slate-800",
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    variants: {
      type: {
        primary: "", // ベーススタイルが primary に相当
        secondary:
          "bg-slate-300 text-slate-800 hover:bg-slate-400 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700",
        danger: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      },
    },
  }),

  text: {
    title: tv({ base: "mb-4 text-3xl font-bold text-slate-800 dark:text-slate-200" }),
    sectionTitle: tv({
      base: "mb-4 text-xl font-bold text-slate-800 dark:text-slate-200",
    }),
    subtitle: tv({ base: "text-lg font-semibold text-slate-700 dark:text-slate-300" }),
    body: tv({}),
    link: tv({
      base: "text-blue-600 underline transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
    }),
    highlight: tv({}),
    error: tv({
      base: "rounded-md bg-red-200 p-2 text-red-500 dark:bg-red-600/50 dark:text-red-400",
    }),
    success: tv({
      base: "rounded-md bg-green-200 p-2 text-green-500 dark:bg-green-500/50 dark:text-green-400",
    }),
    warning: tv({
      base: "rounded-md bg-amber-200 p-2 text-amber-500 dark:bg-amber-600/50 dark:text-amber-300",
    }),
    info: tv({ base: ["text-sm text-slate-800 dark:text-slate-300"] }),
    code: tv({
      base: "rounded-md bg-slate-100 p-2 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-200",
    }),
  },

  filterCard: tv({
    base: "overflow-hidden rounded-lg bg-slate-100 shadow-md dark:bg-slate-800",
  }),

  record: {
    activityStatusStyles: tv({
      base: "",
      variants: {
        status: {
          deleted: "after:content-[' -'] opacity-60",
          added: "after:content-[' +'] font-bold",
          updated: "after:content-[' *']",
          unchanged: "font-normal",
        },
      },
    }),

    dayActivitySummaryStyles: tv({
      base: "flex items-center justify-between rounded-sm px-2 py-1 font-medium md:text-xs",
      variants: {
        status: {
          deleted: "text-red-500 opacity-70 dark:text-red-500",
          added:
            "rounded-sm border border-green-500 font-bold text-green-700 dark:text-green-400",
          updated: "font-bold text-blue-600 dark:text-blue-400",
          unchanged: "font-normal text-slate-700 dark:text-slate-300",
        },
      },
    }),
  },
}
