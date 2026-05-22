'use client';

import Link from 'next/link';
import { CLASSES } from '@/lib/utils';

const CLASS_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-pink-500 to-pink-600',
];

export default function ClassSelector() {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
      {CLASSES.map((cls, idx) => (
        <Link
          key={cls}
          href={`/notes?class=${cls}`}
          className={`bg-gradient-to-br ${CLASS_COLORS[idx % CLASS_COLORS.length]} text-white rounded-2xl p-4 text-center hover:scale-105 transition-transform shadow-md hover:shadow-lg`}
        >
          <div className="font-display font-bold text-2xl">{cls}</div>
          <div className="text-xs text-white/80 mt-1">{cls === 'College' ? 'UG/PG' : 'Class'}</div>
        </Link>
      ))}
    </div>
  );
}
