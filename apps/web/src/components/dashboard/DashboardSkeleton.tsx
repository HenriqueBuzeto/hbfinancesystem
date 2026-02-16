'use client';

import { motion } from 'framer-motion';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-white/10" />
        <div className="h-10 w-48 animate-pulse rounded-xl bg-white/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-white/15" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-white/10" />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-72 animate-pulse rounded-xl bg-white/5" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 h-6 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-72 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-1/4 animate-pulse rounded bg-white/5" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-64 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
