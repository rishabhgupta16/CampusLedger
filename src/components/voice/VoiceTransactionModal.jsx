import React, { useEffect, useRef, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useFinance } from '../../hooks/useFinance';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { parseVoiceTranscript } from '../../utils/voiceParser';
import { INCOME_CATEGORIES, getCategoriesByPersona } from '../../constants/categories';
import { getCurrentDateISO } from '../../utils/dateUtils';
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  Save,
  AlertCircle,
  Quote,
  Sparkles,
} from 'lucide-react';

export default function VoiceTransactionModal({ isOpen, onClose, onSuccess }) {
  const { state, addTransaction } = useFinance();
  const persona = state.preferences.persona;

  const {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // 'ready' | 'listening' | 'review'
  const [phase, setPhase] = useState('ready');
  const wasListeningRef = useRef(false);

  // Editable reviewed fields (never auto-saved; user must confirm)
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getCurrentDateISO());
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const availableCategories = type === 'income' ? INCOME_CATEGORIES : getCategoriesByPersona(persona);

  // Reset everything whenever the modal is opened fresh
  useEffect(() => {
    if (isOpen) {
      setPhase('ready');
      resetTranscript();
      setFormError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // When recognition naturally stops after the user finishes speaking, parse and move to review
  useEffect(() => {
    if (wasListeningRef.current && !isListening && phase === 'listening') {
      if (transcript && transcript.trim()) {
        const parsed = parseVoiceTranscript(transcript);
        setType(parsed.type);
        setAmount(parsed.amount ? String(parsed.amount) : '');
        setCategory(parsed.category);
        setDescription(parsed.description);
        setDate(parsed.date || getCurrentDateISO());
        setPhase('review');
      } else if (!error) {
        setPhase('ready');
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, phase, transcript, error]);

  const handleStartListening = () => {
    resetTranscript();
    setFormError('');
    setPhase('listening');
    startListening();
  };

  const handleTryAgain = () => {
    resetTranscript();
    setFormError('');
    handleStartListening();
  };

  const handleClose = () => {
    if (isListening) stopListening();
    onClose();
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount before saving.');
      return;
    }
    if (!category) {
      setFormError('Please select a category.');
      return;
    }

    setFormError('');
    setIsSaving(true);
    try {
      // Same addTransaction() path (and therefore the same API endpoint) as
      // manual entry — voice is just another way to fill out this same form.
      await addTransaction({
        type,
        amount: parsedAmount,
        category,
        description: description.trim() || category,
        date,
      });

      if (onSuccess) onSuccess(`Voice entry saved: ${category} (${type === 'income' ? '+' : '-'}₹${parsedAmount}).`);
      handleClose();
    } catch (error) {
      setFormError(error.message || 'Could not save this transaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add by Voice"
      subtitle="Speak your expense, then review before saving — nothing is saved automatically"
      maxWidth="max-w-md"
    >
      {!isSupported && (
        <div className="text-center py-6 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <MicOff className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Voice input isn't supported in this browser
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Try Google Chrome or Microsoft Edge on desktop or Android to use voice-powered transaction entry.
          </p>
          <Button variant="outline" size="md" onClick={handleClose} className="mt-2">
            Close
          </Button>
        </div>
      )}

      {isSupported && phase === 'ready' && (
        <div className="text-center py-6 space-y-4">
          <button
            type="button"
            onClick={handleStartListening}
            className="w-20 h-20 mx-auto rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 transition-all active:scale-95"
          >
            <Mic className="w-8 h-8" />
          </button>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tap to speak</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              e.g. "80 rupees canteen lunch" or "received 500 rupees pocket money"
            </p>
          </div>
          {error && (
            <div className="flex items-center gap-2 justify-center text-xs text-rose-500 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {isSupported && phase === 'listening' && (
        <div className="text-center py-6 space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <span className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
            <button
              type="button"
              onClick={stopListening}
              className="relative w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Listening... tap to stop</p>
          <div className="min-h-[2.5rem] px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
            {transcript || <span className="text-slate-400">Say your expense out loud...</span>}
          </div>
        </div>
      )}

      {isSupported && phase === 'review' && (
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 text-brand-800 dark:text-brand-300">
            <Quote className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs italic leading-relaxed">"{transcript}"</p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Review and edit the parsed details below, then confirm.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="md" icon={RotateCcw} onClick={handleTryAgain} disabled={isSaving}>
              Try Again
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="md" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" icon={Save} loading={isSaving} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Confirm & Save'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
