import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manager")({
  head: () => ({
    meta: [
      { title: "Manager — Marsa Dhahab Hotel" },
      { name: "description", content: "Manager workspace for Marsa Dhahab Hotel operations." },
      { property: "og:title", content: "Manager — Marsa Dhahab Hotel" },
      { property: "og:description", content: "Manager workspace for Marsa Dhahab Hotel operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManagerPage,
});

function ManagerPage() {
  return <div className="h-full" />;
}
