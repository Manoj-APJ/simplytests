'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchTests } from '@/services/api';
import { Test } from '@/types';

export default function Home() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await fetchTests();
        setTests(data);
      } catch (err) {
        setError('Failed to load tests. Please ensure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
            SSC CGL <span className="text-primary">Mock Test</span> Portal
          </h1>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Prepare for excellence with our production-quality mock tests. 
            Real exam experience with instant results.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map((test, index) => (
            <div 
              key={test.id} 
              className="glass-card rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl flex flex-col animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-3">{test.title}</h2>
              <p className="text-secondary mb-6 flex-grow">{test.description}</p>
              
              <div className="flex items-center justify-between mb-6 text-sm font-medium">
                <span className="flex items-center text-secondary">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {test.duration} Mins
                </span>
                <span className="flex items-center text-secondary">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {test._count.questions} Questions
                </span>
              </div>

              <Link 
                href={`/test/${test.id}`}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl text-center transition-colors shadow-lg shadow-blue-500/20"
              >
                Start Test
              </Link>
            </div>
          ))}

          {tests.length === 0 && !loading && !error && (
            <div className="col-span-full text-center py-20">
              <p className="text-secondary text-xl">No mock tests available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
