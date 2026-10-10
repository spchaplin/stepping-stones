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
        className="absolute inset-0 bg-[#302820]/45"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full max-w-md rounded-2xl border border-[#e5dbcf] bg-[#fbf9f5] shadow-2xl overflow-hidden"
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ duration: 0.25 }}
      >
        <div className="h-1 w-full bg-[#b9684f]" />

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[#342b24]">About Life Vision</h2>
              <p className="text-xs text-[#82766a] mt-0.5">A Charting the LifeCourse tool</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#82766a] hover:text-[#342b24] hover:bg-[#f1e9df] transition-all cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Logo / wordmark */}
          <div
            className="px-4 py-3 rounded-xl border border-[#e5d8c9] bg-[#f4ede4]"
          >
            <p className="text-sm font-bold text-[#514238]">LifeCourse Nexus</p>
            <p className="text-xs text-[#82766a] mt-0.5">
              A Part of the Charting the LifeCourse Personal Decision Making Foundational Tools
            </p>
          </div>

          {/* Description */}
          <div className="space-y-3 text-sm text-[#66594d] leading-relaxed">
            <p>
              <strong className="text-[#342b24]">Life Vision</strong> is a personal planning tool based on the{' '}
              <em>Charting the LifeCourse Framework</em>. It helps individuals articulate what a{' '}
              <strong className="text-[#342b24]">good life</strong> looks like across eight core life domains —
              from health and safety to community, relationships, and advocacy.
            </p>
            <p>
              By writing a vision for each domain and ranking your priorities, you create a personal
              compass that can guide decisions, conversations, and next steps on your life journey.
            </p>
          </div>

          {/* Life domains list */}
          <div>
            <p className="text-xs font-bold text-[#82766a] uppercase tracking-widest mb-2">Life Domains</p>
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
                  className="text-xs text-[#66594d] px-2.5 py-1.5 rounded-lg border border-[#e9e0d6] bg-[#f8f5ef]"
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Footer attribution */}
          <div
            className="px-4 py-3 rounded-xl border border-[#e9e0d6] bg-[#f6f1e9] text-xs text-[#82766a] leading-relaxed"
          >
            <p>
              LifeCourse Framework and Tools, iconography, and assets developed by the{' '}
              <strong className="text-[#62564c]">LifeCourse Nexus</strong> · 2025
            </p>
            <p className="mt-1">
              Curators of the University of Missouri | UMKC-IHD, UCEDD
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#efe7dd] hover:bg-[#e8ddcf] text-[#62564c] hover:text-[#342b24] text-sm font-semibold transition-all cursor-pointer border border-[#e3d8cb]"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
