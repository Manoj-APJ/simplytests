'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmissionResult } from '@/types';

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: testId } = use(params);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    const savedResult = localStorage.getItem(`result_${testId}`);
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      router.push('/');
    }
  }, [testId, router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const scoreColor = result.score >= result.totalQuestions * 0.7 ? 'text-green-500' : 'text-amber-500';

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Test Results</h1>
          <p className="text-secondary text-lg">Great job completing the mock test! Here is how you performed.</p>
        </header>

        {/* Score Card */}
        <div className="glass-card rounded-3xl p-8 md:p-12 mb-8 shadow-2xl border border-white/50 text-center animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="flex flex-col">
              <span className="text-secondary font-medium mb-1 uppercase tracking-widest text-sm">Total Score</span>
              <span className={`text-7xl font-black ${scoreColor}`}>
                {result.score}<span className="text-2xl text-secondary">/{result.totalQuestions}</span>
              </span>
            </div>
            
            <div className="w-px h-24 bg-border hidden md:block"></div>

            <div className="flex flex-col">
              <span className="text-secondary font-medium mb-1 uppercase tracking-widest text-sm">Accuracy</span>
              <span className="text-5xl font-bold text-primary">{result.accuracy}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-slate-50 p-4 rounded-2xl border border-border">
              <div className="text-green-600 font-bold text-2xl">{result.correctCount}</div>
              <div className="text-secondary text-xs uppercase font-bold">Correct</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-border">
              <div className="text-red-500 font-bold text-2xl">{result.incorrectCount}</div>
              <div className="text-secondary text-xs uppercase font-bold">Incorrect</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-border">
              <div className="text-primary font-bold text-2xl">{result.totalQuestions}</div>
              <div className="text-secondary text-xs uppercase font-bold">Questions</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-border">
              <div className="text-amber-500 font-bold text-2xl">
                {result.totalQuestions - (result.correctCount + result.incorrectCount)}
              </div>
              <div className="text-secondary text-xs uppercase font-bold">Unattempted</div>
            </div>
          </div>
        </div>

        {/* Detailed Review (Optional but good for UX) */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Question Review</h2>
          {result.evaluationDetails.map((detail, idx) => (
            <div key={idx} className={`glass-card rounded-2xl p-6 border-l-8 ${detail.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
               <div className="flex items-center justify-between mb-4">
                 <span className="font-bold text-secondary">Question {idx + 1}</span>
                 {detail.isCorrect ? (
                   <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Correct</span>
                 ) : (
                   <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Incorrect</span>
                 )}
               </div>
               <div className="flex flex-col gap-2">
                 <div className="flex items-center">
                    <span className="w-24 text-secondary text-sm">Your Answer:</span>
                    <span className={`font-bold ${detail.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                      {detail.userAnswer || 'Not Attempted'}
                    </span>
                 </div>
                 {!detail.isCorrect && (
                   <div className="flex items-center">
                      <span className="w-24 text-secondary text-sm">Correct:</span>
                      <span className="font-bold text-green-600">{detail.correctAnswer}</span>
                   </div>
                 )}
               </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Link 
            href="/"
            className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-xl shadow-blue-500/20"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
