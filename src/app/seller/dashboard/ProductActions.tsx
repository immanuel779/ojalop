"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Trash2, Edit, Loader2, MoreVertical, Copy,
  Link2, Archive, Package, AlertTriangle, X, PauseCircle,
  PlayCircle, ExternalLink,
} from "lucide-react";
import {
  deleteProductAction,
  toggleProductVisibilityAction,
  archiveProductAction,
  duplicateProductAction,
} from "../products/new/actions";
import { toast } from "sonner";

// ============================================================
// TYPES
// ============================================================
interface Props {
  id: string;
  slug: string;
  isActive: boolean;
  title?: string;
}

type Busy = null | "delete" | "toggle" | "archive" | "duplicate";

// ============================================================
// COMPONENT
// ============================================================
export default function ProductActions({ id, slug, isActive, title }: Props) {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // ---------- CLOSE MENU ON OUTSIDE CLICK / ESC ----------
  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // ---------- ACTIONS ----------
  async function handleToggle() {
    setBusy("toggle");
    try {
      const res = await toggleProductVisibilityAction(id, isActive);
      if (!res.success) {
        toast.error("Update failed", { description: res.error });
        return;
      }
      toast.success(
        isActive ? "Listing hidden from public" : "Listing is now visible"
      );
      router.refresh();
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setBusy(null);
      setMenuOpen(false);
    }
  }

  async function handleDelete() {
    setBusy("delete");
    try {
      const res = await deleteProductAction(id);
      if (!res.success) {
        toast.error("Delete failed", { description: res.error });
        return;
      }
      toast.success("Listing deleted");
      setConfirmDelete(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setBusy(null);
      setMenuOpen(false);
    }
  }

  async function handleArchive() {
    setBusy("archive");
    try {
      const res = await archiveProductAction(id);
      if (!res.success) {
        toast.error("Archive failed", { description: res.error });
        return;
      }
      toast.success("Listing archived");
      setConfirmArchive(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setBusy(null);
      setMenuOpen(false);
    }
  }

  async function handleDuplicate() {
    setBusy("duplicate");
    try {
      const res = await duplicateProductAction(id);
      if (!res.success) {
        toast.error("Duplicate failed", { description: res.error });
        return;
      }
      toast.success("Listing duplicated as draft");
      router.refresh();
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setBusy(null);
      setMenuOpen(false);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/products/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: url });
    } catch {
      toast.error("Could not copy", { description: url });
    }
    setMenuOpen(false);
  }

  // ---------- RENDER ----------
  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {/* View public page */}
        <Link
          href={`/products/${slug}`}
          target="_blank"
          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
          title="View public page"
        >
          <Eye size={18} />
        </Link>

        {/* Edit */}
        <Link
          href={`/seller/products/${id}/edit`}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Edit listing"
        >
          <Edit size={18} />
        </Link>

        {/* Toggle visibility */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy !== null}
          className={`p-2 rounded-lg transition disabled:opacity-50 ${
            isActive
              ? "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
              : "text-yellow-600 bg-yellow-50"
          }`}
          title={isActive ? "Hide listing" : "Show listing"}
        >
          {busy === "toggle" ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isActive ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

        {/* More menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            disabled={busy !== null}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            title="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-1"
            >
              <MenuItem
                icon={<Link2 size={16} />}
                label="Copy link"
                onClick={handleCopyLink}
              />
              <MenuItem
                icon={busy === "duplicate" ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                label="Duplicate as draft"
                onClick={handleDuplicate}
                disabled={busy !== null}
              />
              <MenuItem
                icon={busy === "archive" ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
                label="Archive listing"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmArchive(true);
                }}
                disabled={busy !== null}
              />
              <div className="border-t border-gray-100" />
              <MenuItem
                icon={<Trash2 size={16} />}
                label="Delete permanently"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmDelete(true);
                }}
                variant="danger"
                disabled={busy !== null}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <ConfirmModal
          icon={<Trash2 size={28} />}
          title="Delete this listing?"
          body={`"${title ?? "This listing"}" will be permanently removed along with all its images. This cannot be undone.`}
          confirmLabel="Delete permanently"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          loading={busy === "delete"}
        />
      )}

      {/* Archive confirmation modal */}
      {confirmArchive && (
        <ConfirmModal
          icon={<Archive size={28} />}
          title="Archive this listing?"
          body={`"${title ?? "This listing"}" will be hidden from public but kept in your dashboard. You can restore it later.`}
          confirmLabel="Archive"
          confirmVariant="neutral"
          onConfirm={handleArchive}
          onCancel={() => setConfirmArchive(false)}
          loading={busy === "archive"}
        />
      )}
    </>
  );
}

// ============================================================
// MENU ITEM
// ============================================================
function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}) {
  const base =
    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "danger"
      ? "text-red-600 hover:bg-red-50"
      : "text-gray-700 hover:bg-gray-50";

  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ============================================================
// CONFIRM MODAL
// ============================================================
function ConfirmModal({
  icon,
  title,
  body,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  confirmVariant: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loading, onCancel]);

  const confirmClasses =
    confirmVariant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-gray-900 hover:bg-gray-800 text-white";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`shrink-0 p-2.5 rounded-xl ${
              confirmVariant === "danger"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{title}</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{body}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 disabled:opacity-60 ${confirmClasses}`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Working...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}