import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, X, ShieldAlert, Award, Footprints } from 'lucide-react';

interface PlankEditorProps {
  isOpen: boolean;
  text: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  plankNumber: number;
  onRemove?: () => void;
}

const guidedQuestions = [
  "What is the first fundamental habit or milestone you need to conquer today?",
  "What practical skills, certifications, or workflows must you master next?",
  "How will you sustain consistency? (e.g., spending 1 hour every evening coding)",
  "What support system, mentor network, or communities will you engage with here?",
  "How will you handle setbacks, and configure self-correction mechanisms?",
  "What milestone proves that this block is securely locked in your foundation?",
  "The ultimate breakthrough! What final leap bridges your preparation into your grand dream?"
];

export default function PlankEditor({
  isOpen,
  text,
  onChangeText,
  onSave,
  onCancel,
  title,
  plankNumber,
  onRemove
}: PlankEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically focus on text entrance
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      }, 100);
    }
  }, [isOpen]);

  const currentQuestion = guidedQuestions[Math.min(plankNumber - 1, guidedQuestions.length - 1)] || "Define this intentional bridge step.";

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="plank-edit-modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 220 } }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border-4 border-stone-800 bg-stone-100 p-6 shadow-2xl relative"
          >
            {/* Rivets in corners */}
            <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-[1.5px] bg-stone-700" />
            </div>
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-[1.5px] bg-stone-700" />
            </div>
            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-[1.5px] bg-stone-700" />
            </div>
            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-stone-400 border border-stone-600 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-[1.5px] bg-stone-700" />
            </div>
 
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-stone-200 rounded-lg text-stone-800 border border-stone-300">
                  <Footprints className="w-5 h-5 text-stone-700 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-bold block">
                    Bridge Segment #{plankNumber}
                  </span>
                  <h3 id="plank-modal-title" className="text-lg font-serif font-bold text-stone-900 leading-tight">
                    {title}
                  </h3>
                </div>
              </div>
              <button
                id="close-plank-modal-btn"
                onClick={onCancel}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            {/* Guided Prompt Question (Helping user design concrete steps) */}
            <div className="relative z-10 bg-stone-200/60 border border-stone-300/40 p-4 rounded-xl mb-4">
              <p className="text-[10px] text-stone-600 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600 animate-spin" /> Intentional Guidance Question
              </p>
              <p className="text-xs text-stone-800 leading-relaxed font-semibold italic">
                "{currentQuestion}"
              </p>
            </div>
 
            {/* Main Textarea */}
            <div className="relative z-10 mb-4 h-28">
              <textarea
                id="plank-text-input"
                ref={textareaRef}
                value={text}
                onChange={(e) => onChangeText(e.target.value.slice(0, 100))} // Limit 100 chars to avoid layout overflow
                placeholder="Write your intention step here... (e.g., Practice web development 2 hours daily, focusing on Tailwind and state patterns)"
                className="w-full h-full p-4 bg-stone-50 border-2 border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:border-stone-600 focus:ring-1 focus:ring-stone-600 leading-relaxed resize-none shadow-inner"
              />
              <div className="absolute bottom-2 right-3 text-[10px] font-mono font-medium text-stone-500">
                {text.length} / 100 characters
              </div>
            </div>
 
            {/* Validation Indicator if empty */}
            {text.trim().length === 0 && (
              <div className="relative z-10 flex items-center gap-2 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-4 text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Write a short sentence to place this plank and lock it onto the bridge ropes.</span>
              </div>
            )}
 
            {/* Action Buttons */}
            <div className="relative z-10 flex check justify-between items-center border-t border-stone-200 pt-4">
              <div>
                {onRemove && (
                  <button
                    id="remove-plank-btn"
                    className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer transition-colors"
                    onClick={onRemove}
                  >
                    Remove Plank
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  id="cancel-plank-btn"
                  className="px-4 py-2 text-sm text-stone-650 border border-stone-300 rounded-xl hover:bg-stone-200 cursor-pointer transition-colors animate-none"
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  id="save-plank-btn"
                  disabled={text.trim().length === 0}
                  className={`flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer bg-stone-800 hover:bg-stone-900 text-neutral-50 active:scale-[0.98] ${text.trim().length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  onClick={onSave}
                >
                  <Check className="w-4 h-4" />
                  <span>Build Plank</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
