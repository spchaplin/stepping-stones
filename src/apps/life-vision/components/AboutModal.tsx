import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: 'rgba(10,15,30,0.98)' }}
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ duration: 0.25 }}
      >
        {/* Gradient top bar */}
        <div
          className="h-1 w-full"
          style={{ backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #fb923c)' }}
        />

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-white">About Life Vision</h2>
              <p className="text-xs text-slate-400 mt-0.5">A Charting the LifeCourse tool</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Logo / wordmark */}
          <div
            className="px-4 py-3 rounded-xl border border-white/8"
            style={{ background: 'rgba(129,140,248,0.07)' }}
          >
            <p className="text-sm font-bold text-slate-200">LifeCourse Nexus</p>
            <p className="text-xs text-slate-400 mt-0.5">
              A Part of the Charting the LifeCourse Personal Decision Making Foundational Tools
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">Life Vision</strong> is a personal planning tool based on the{' '}
              <em>Charting the LifeCourse Framework</em>. It helps individuals articulate what a{' '}
              <strong className="text-white">good life</strong> looks like across eight core life domains —
              from health and safety to community, relationships, and advocacy.
            </p>
            <p>
              By writing a vision for each domain and ranking your priorities, you create a personal
              compass that can guide decisions, conversations, and next steps on your life journey.
            </p>
          </div>

          {/* Life domains list */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Life Domains</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                'Healthy Living',
                'Safety & Security',
                'Supports for Family',
                'Supports & Services',
                'Daily Life & Employment',
                'Community Living',
                'Social & Spirituality',
                'Advocacy & Engagement',
              ].map(d => (
                <div
                  key={d}
                  className="text-xs text-slate-300 px-2.5 py-1.5 rounded-lg border border-white/6"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Footer attribution */}
          <div
            className="px-4 py-3 rounded-xl border border-white/6 text-xs text-slate-500 leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <p>
              LifeCourse Framework and Tools, iconography, and assets developed by the{' '}
              <strong className="text-slate-400">LifeCourse Nexus</strong> · 2025
            </p>
            <p className="mt-1">
              Curators of the University of Missouri | UMKC-IHD, UCEDD
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all cursor-pointer border border-white/5"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
