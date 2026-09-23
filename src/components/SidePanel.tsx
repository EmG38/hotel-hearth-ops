import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function SidePanel({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-on-surface/30 backdrop-blur-[1px]"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-outline-variant bg-surface-container-lowest shadow-raised">
        <div className="flex items-start gap-3 border-b border-outline-variant p-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-title-lg text-on-surface">{title}</h2>
            {subtitle ? (
              <p className="text-body-sm mt-0.5 text-on-surface-variant">{subtitle}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container"
            aria-label="Close panel"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-outline-variant bg-surface p-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
