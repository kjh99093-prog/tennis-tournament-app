import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../i18n/LanguageContext';
import { MatchNote } from '../types';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  User,
  Shield,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';

export const NotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, tournaments } = useApp();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<MatchNote | null>(null);\n  const [pendingDeleteNote, setPendingDeleteNote] = useState<MatchNote | null>(null);

  const [formData, setFormData] = useState({
    tournamentId: '',
    opponentName: '',
    date: '2026-10-15',
    surface: 'Indoor Hard',
    matchType: 'Singles' as 'Singles' | 'Doubles' | 'Practice',
    score: '',
    racketTension: '52 lbs',
    tagsInput: 'Scouting, Match Strategy',
    tacticalNotes: '',
    takeawaysInput: 'Focus on depth, Attack second serves'
  });

  const openNewNoteModal = () => {
    setEditingNote(null);
    setFormData({
      tournamentId: tournaments[0]?.id || '',
      opponentName: '',
      date: '2026-10-15',
      surface: 'Indoor Hard',
      matchType: 'Singles',
      score: '',
      racketTension: '52 lbs',
      tagsInput: 'Match Prep, Tactical Plan',
      tacticalNotes: '',
      takeawaysInput: ''
    });
    setIsModalOpen(true);
  };

  const openEditNoteModal = (note: MatchNote) => {
    setEditingNote(note);
    setFormData({
      tournamentId: note.tournamentId || '',
      opponentName: note.opponentName || '',
      date: note.date,
      surface: note.surface || 'Indoor Hard',
      matchType: (note.matchType as any) || 'Singles',
      score: note.score || '',
      racketTension: note.racketTension || '',
      tagsInput: note.tags?.join(', ') || '',
      tacticalNotes: note.tacticalNotes,
      takeawaysInput: note.keyTakeaways?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTourney = tournaments.find((t) => t.id === formData.tournamentId);

    const tags = formData.tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const keyTakeaways = formData.takeawaysInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingNote) {
      updateNote({
        ...editingNote,
        tournamentId: formData.tournamentId || undefined,
        tournamentTitle: selectedTourney ? selectedTourney.title : undefined,
        opponentName: formData.opponentName,
        date: formData.date,
        surface: formData.surface,
        matchType: formData.matchType,
        score: formData.score,
        racketTension: formData.racketTension,
        tags,
        tacticalNotes: formData.tacticalNotes,
        keyTakeaways
      });
    } else {
      addNote({
        tournamentId: formData.tournamentId || undefined,
        tournamentTitle: selectedTourney ? selectedTourney.title : undefined,
        opponentName: formData.opponentName,
        date: formData.date,
        surface: formData.surface,
        matchType: formData.matchType,
        score: formData.score,
        racketTension: formData.racketTension,
        tags,
        tacticalNotes: formData.tacticalNotes,
        keyTakeaways
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-[#F3F5F0]">
            {t('notes_title')}
          </h1>
          <p className="text-xs text-[#AAB9B3] mt-0.5">
            {t('notes_subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={openNewNoteModal}
          className="px-3.5 py-2 rounded-xl bg-[#D5FA63] text-[#151F24] font-bold text-xs shadow-md hover:bg-[#cbf74e] transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('new_note_btn')}</span>
        </button>
      </div>

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-[#20352F] border border-[#354740] rounded-2xl p-4 shadow-sm hover:border-[#6677FF]/40 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {note.tournamentTitle ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#151F24] text-[#D5FA63] border border-[#354740] truncate max-w-xs">
                        {note.tournamentTitle}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#151F24] text-[#AAB9B3]">
                        {t('standalone_note')}
                      </span>
                    )}

                    {note.surface && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#293B35] text-[#A78BFA]">
                        {note.surface}
                      </span>
                    )}

                    {note.matchType && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#293B35] text-[#F3F5F0]">
                        {note.matchType}
                      </span>
                    )}
                  </div>

                  {note.opponentName && (
                    <h3 className="font-bold text-base text-[#F3F5F0] flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#6677FF]" />
                      <span>vs. {note.opponentName}</span>
                    </h3>
                  )}

                  <div className="flex items-center gap-2 text-xs text-[#AAB9B3] mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{note.date}</span>
                    {note.score && (
                      <>
                        <span className="text-[#354740]">•</span>
                        <span className="text-[#D5FA63] font-semibold">{note.score}</span>
                      </>
                    )}
                    {note.racketTension && (
                      <>
                        <span className="text-[#354740]">•</span>
                        <span>{note.racketTension}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditNoteModal(note)}
                    className="p-1.5 rounded-lg bg-[#293B35] text-[#AAB9B3] hover:text-[#F3F5F0] transition-colors"
                    title={t('edit_note_btn')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteNote(note)}
                    className="p-1.5 rounded-lg bg-[#293B35] text-[#AAB9B3] hover:text-[#FF5D64] transition-colors"
                    title={t('delete_note_btn')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tactical Notes Content */}
              <div className="bg-[#151F24]/70 p-3 rounded-xl border border-[#354740]/60 text-xs text-[#F3F5F0] leading-relaxed">
                <span className="text-[10px] uppercase font-bold text-[#AAB9B3] block mb-1">
                  {t('note_tactics_label')}
                </span>
                <p className="whitespace-pre-line">{note.tacticalNotes}</p>
              </div>

              {/* Key Takeaways */}
              {note.keyTakeaways && note.keyTakeaways.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#D5FA63] tracking-wider block">
                    {t('note_takeaways_label')}
                  </span>
                  <ul className="list-disc list-inside text-xs text-[#AAB9B3] space-y-0.5">
                    {note.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#354740]/60">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#293B35] text-[10px] font-medium text-[#AAB9B3]"
                    >
                      <Tag className="w-2.5 h-2.5 text-[#D5FA63]" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#20352F] border border-[#354740] rounded-2xl p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-[#AAB9B3]/60 mx-auto" />
          <h3 className="font-bold text-base text-[#F3F5F0]">
            {t('empty_notes_title')}
          </h3>
          <p className="text-xs text-[#AAB9B3] max-w-sm mx-auto leading-relaxed">
            {t('empty_notes_desc')}
          </p>
          <button
            type="button"
            onClick={openNewNoteModal}
            className="px-5 py-2.5 rounded-xl bg-[#D5FA63] text-[#151F24] text-xs font-bold shadow-md hover:bg-[#cbf74e] transition-colors"
          >
            {t('new_note_btn')}
          </button>
        </div>
      )}

      {/* Delete confirmation: prevent accidental permanent loss */}
      {pendingDeleteNote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" role="presentation" onClick={() => setPendingDeleteNote(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="delete-note-title" className="w-full max-w-sm rounded-2xl border border-[#526A5D] bg-[#20352F] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#4A2427] text-[#FF9A9F]"><Trash2 className="h-5 w-5" /></div>
            <h3 id="delete-note-title" className="mt-3 text-center text-lg font-extrabold text-[#F3F5F0]">Delete this match note?</h3>
            <p className="mt-2 text-center text-sm leading-5 text-[#B7C4BE]">This will permanently delete this note. This action cannot be undone.</p>
            {pendingDeleteNote.opponentName && <p className="mt-2 text-center text-sm font-semibold text-[#F3F5F0]">vs. {pendingDeleteNote.opponentName}</p>}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPendingDeleteNote(null)} className="rounded-xl border border-[#526A5D] bg-[#293B35] px-3 py-2.5 text-sm font-bold text-[#F3F5F0]">Cancel</button>
              <button type="button" onClick={() => { deleteNote(pendingDeleteNote.id); setPendingDeleteNote(null); }} className="rounded-xl bg-[#C62828] px-3 py-2.5 text-sm font-extrabold text-white hover:bg-[#B71C1C]">Delete note</button>
            </div>
          </section>
        </div>
      )}

      {/* Note Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div
            className="relative w-full max-w-lg bg-[#20352F] border border-[#354740] rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#151F24] p-4 border-b border-[#354740] flex items-center justify-between">
              <h3 className="font-bold text-base text-[#F3F5F0] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D5FA63]" />
                <span>{editingNote ? t('edit_note_btn') : t('new_note_btn')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[#AAB9B3] hover:text-[#F3F5F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              {/* Linked Tournament */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('note_tournament_label')}
                </label>
                <select
                  value={formData.tournamentId}
                  onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                >
                  <option value="">-- {t('standalone_note')} --</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Opponent & Match Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#AAB9B3] font-semibold block">
                    {t('note_opponent_label')}
                  </label>
                  <input
                    type="text"
                    value={formData.opponentName}
                    onChange={(e) => setFormData({ ...formData, opponentName: e.target.value })}
                    placeholder="e.g. Alex Wong"
                    className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAB9B3] font-semibold block">
                    {t('dates')}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                  />
                </div>
              </div>

              {/* Surface & Match Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#AAB9B3] font-semibold block">
                    {t('note_surface_label')}
                  </label>
                  <select
                    value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                    className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                  >
                    <option value="Indoor Hard">Indoor Hard</option>
                    <option value="Hard">Hard</option>
                    <option value="Clay">Clay</option>
                    <option value="Grass">Grass</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#AAB9B3] font-semibold block">
                    {t('note_type_label')}
                  </label>
                  <select
                    value={formData.matchType}
                    onChange={(e) => setFormData({ ...formData, matchType: e.target.value as any })}
                    className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                  >
                    <option value="Singles">{t('tag_singles')}</option>
                    <option value="Doubles">{t('tag_doubles')}</option>
                    <option value="Practice">{t('tag_practice')}</option>
                  </select>
                </div>
              </div>

              {/* Tactics & Game Plan */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('note_tactics_label')}
                </label>
                <textarea
                  rows={3}
                  value={formData.tacticalNotes}
                  onChange={(e) => setFormData({ ...formData, tacticalNotes: e.target.value })}
                  placeholder={t('note_tactics_placeholder')}
                  required
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg p-3 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Key Takeaways */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  {t('note_takeaways_label')}
                </label>
                <input
                  type="text"
                  value={formData.takeawaysInput}
                  onChange={(e) => setFormData({ ...formData, takeawaysInput: e.target.value })}
                  placeholder={t('note_takeaways_placeholder')}
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-[#AAB9B3] font-semibold block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  placeholder="e.g. Kick Serve, Net Attack, Fast Courts"
                  className="w-full bg-[#151F24] border border-[#354740] rounded-lg px-3 py-2 text-[#F3F5F0] outline-hidden focus:border-[#D5FA63]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#354740]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#293B35] text-[#AAB9B3] hover:text-[#F3F5F0] font-semibold"
                >
                  {t('cancel_btn')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#D5FA63] text-[#151F24] font-bold shadow-md hover:bg-[#cbf74e]"
                >
                  {t('save_note_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
