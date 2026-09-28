/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetConfirmModal({ isOpen, onClose, onConfirm }: ResetConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-[6px] cursor-pointer"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-6 z-10"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Icon */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Reset Workspace
                </h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                  Action cannot be undone
                </p>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                Do you want to reset your cards back to the default cards?
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onClose}
                type="button"
                className="flex-1 py-3 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 font-extrabold uppercase text-xs tracking-wider transition-all cursor-pointer active:scale-95"
              >
                No, Keep cards
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase text-xs tracking-wider py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 border border-emerald-400/20 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Reset</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
