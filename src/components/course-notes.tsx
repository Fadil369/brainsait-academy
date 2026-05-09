"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocale, type Locale } from "@/components/locale-provider";

interface Note {
  id: string;
  content: string;
  sectionIndex?: number;
  sectionHeading?: string;
  createdAt: number;
  updatedAt: number;
}

interface CourseNotesProps {
  courseSlug: string;
  sections: { heading: string; isArabic: boolean; content: string }[];
  locale: Locale;
}

function readNotes(key: string): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes(key: string, notes: Note[]) {
  localStorage.setItem(key, JSON.stringify(notes));
}

export function CourseNotes({ courseSlug, sections, locale }: CourseNotesProps) {
  const [notes, setNotes] = useState<Note[]>(() => readNotes(`notes-${courseSlug}`));
  const [newNote, setNewNote] = useState("");
  const [selectedSection, setSelectedSection] = useState<number | undefined>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const isAr = locale === "ar";
  const storageKey = `notes-${courseSlug}`;

  useEffect(() => {
    saveNotes(storageKey, notes);
  }, [notes, storageKey]);

  const handleAddNote = useCallback(() => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `note-${Date.now()}`,
      content: newNote.trim(),
      sectionIndex: selectedSection,
      sectionHeading: selectedSection !== undefined ? sections[selectedSection]?.heading : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
    toast(isAr ? "✅ تمت إضافة الملاحظة" : "✅ Note added");
  }, [newNote, selectedSection, sections, isAr]);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast(isAr ? "تم حذف الملاحظة" : "Note deleted");
  }, [isAr]);

  const handleEditNote = useCallback((note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editContent.trim()) return;
    setNotes((prev) =>
      prev.map((n) => (n.id === editingId ? { ...n, content: editContent.trim(), updatedAt: Date.now() } : n))
    );
    setEditingId(null);
    setEditContent("");
    toast(isAr ? "✅ تم تحديث الملاحظة" : "✅ Note updated");
  }, [editContent, editingId, isAr]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalNotes = notes.length;
  const wordsWritten = notes.reduce((acc, n) => acc + n.content.split(/\s+/).filter(Boolean).length, 0);

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
            </div>
            <h3 className="font-headline text-sm font-bold">{isAr ? "ملاحظاتي" : "My Notes"}</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container">{totalNotes} {isAr ? "ملاحظة" : "notes"}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-surface-container">{wordsWritten} {isAr ? "كلمة" : "words"}</span>
          </div>
        </div>

        {/* Add Note */}
        <div className="space-y-2">
          {sections.length > 0 && (
            <select
              value={selectedSection ?? ""}
              onChange={(e) => setSelectedSection(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              <option value="">{isAr ? "بدون قسم محدد" : "No specific section"}</option>
              {sections.map((s, i) => (
                <option key={i} value={i}>{s.heading}</option>
              ))}
            </select>
          )}
          <div className="relative">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleAddNote();
                }
              }}
              placeholder={isAr ? "أضف ملاحظة... (Ctrl+Enter للإرسال)" : "Add a note... (Ctrl+Enter to submit)"}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-surface-container-low px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              dir={locale === "ar" ? "rtl" : "ltr"}
            />
          </div>
          <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="gap-1.5 w-full">
            <span className="material-symbols-outlined text-[15px]">add</span>
            {isAr ? "إضافة ملاحظة" : "Add Note"}
          </Button>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-[32px] block mb-2 text-muted-foreground/30">sticky_note_2</span>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "ابدأ بتدوين أفكارك وملاحظاتك أثناء الدراسة."
                : "Start capturing your thoughts and notes while studying."}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="p-3 rounded-xl bg-surface-container-low border border-border group">
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSaveEdit} className="flex-1 gap-1 text-xs h-7">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                        {isAr ? "حفظ" : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="flex-1 gap-1 text-xs h-7">
                        {isAr ? "إلغاء" : "Cancel"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        {note.sectionHeading && (
                          <span className="text-[10px] font-medium text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded mb-1 inline-block">
                            📌 {note.sectionHeading}
                          </span>
                        )}
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="w-6 h-6 rounded hover:bg-surface-container flex items-center justify-center transition-colors"
                          title={isAr ? "تعديل" : "Edit"}
                        >
                          <span className="material-symbols-outlined text-muted-foreground text-[13px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="w-6 h-6 rounded hover:bg-destructive/10 flex items-center justify-center transition-colors"
                          title={isAr ? "حذف" : "Delete"}
                        >
                          <span className="material-symbols-outlined text-destructive text-[13px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {formatDate(note.updatedAt)}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
