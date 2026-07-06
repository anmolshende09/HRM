import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { announcementService } from "../services/announcementService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { MANAGER_ROLES } from "../constants/roles";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { TextField, TextAreaField } from "../components/common/FormField";
import { formatDate } from "../utils/format";

const emptyForm = { title: "", description: "", date: "" };

export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    announcementService
      .list()
      .then(({ data }) => setItems(data.data))
      .catch(() => toast.error("Couldn't load announcements"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, description: item.description, date: item.date?.split("T")[0] || "" });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title) next.title = "Title is required";
    if (!form.description) next.description = "Description is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      if (editing) {
        await announcementService.update(editing._id, form);
        toast.success("Announcement updated");
      } else {
        await announcementService.create(form);
        toast.success("Announcement posted");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await announcementService.remove(deleteTarget._id);
      toast.success("Announcement deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete announcement");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-display-md">Announcements</h1>
          <p className="text-caption text-ink-muted48 mt-1">Company-wide updates and news.</p>
        </div>
        {canManage && (
          <Button icon={Plus} onClick={openAdd}>
            New Announcement
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading announcements…" />
      ) : items.length === 0 ? (
        <div className="bg-canvas border border-hairline rounded-lg">
          <EmptyState title="No announcements yet" description="Company announcements will show up here." />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-canvas border border-hairline rounded-lg p-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Megaphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-strong">{item.title}</p>
                    <p className="text-fine-print text-ink-muted48 mt-0.5">{formatDate(item.date)}</p>
                    <p className="text-caption text-ink-muted80 mt-2">{item.description}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      aria-label={`Edit ${item.title}`}
                      className="press-active w-8 h-8 rounded-full hover:bg-canvas-parchment flex items-center justify-center text-ink-muted48"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      aria-label={`Delete ${item.title}`}
                      className="press-active w-8 h-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-ink-muted48 hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Announcement" : "New Announcement"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Title" required value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextAreaField label="Description" required rows={4} value={form.description} error={errors.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextField label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? "Save changes" : "Post announcement"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete announcement?"
        description={`This will permanently remove "${deleteTarget?.title}".`}
        confirmLabel="Delete"
      />
    </div>
  );
}
