'use client';

import { useEffect, useState, useCallback, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTestById, submitTest } from '@/services/api';
import { TestDetail, Question } from '@/types';
import '@/app/exam-theme.css';

type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';

export default function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: testId } = use(params);
  
  const [test, setTest] = useState<TestDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      try {
        const data = await fetchTestById(testId);
        setTest(data);
        setTimeLeft(data.duration * 60);
        
        // Initialize statuses
        const initialStatuses: Record<string, QuestionStatus> = {};
        data.questions.forEach((q: { question: Question }, index: number) => {
          initialStatuses[q.question.id] = index === 0 ? 'not-answered' : 'not-visited';
        });
        setStatuses(initialStatuses);
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [testId, router]);

  // Timer logic
  useEffect(() => {
    if (loading || !test || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, test, timeLeft]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await submitTest(testId, answers);
      localStorage.setItem(`result_${testId}`, JSON.stringify(result));
      router.push(`/result/${testId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  }, [testId, answers, router, submitting]);

  const handleOptionSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    // When an option is selected, it's usually marked as answered when "Save & Next" is clicked
    // But for the radio button change, we can just keep the answer in state
  };

  const handleSaveNext = () => {
    const currentQ = test?.questions[currentQuestionIndex];
    if (!currentQ) return;

    const questionId = currentQ.question.id;
    const hasAnswer = !!answers[questionId];

    setStatuses((prev) => ({
      ...prev,
      [questionId]: hasAnswer ? 'answered' : 'not-answered',
    }));

    if (test && currentQuestionIndex < test.questions.length - 1) {
      const nextQId = test.questions[currentQuestionIndex + 1].question.id;
      if (nextQId && statuses[nextQId] === 'not-visited') {
        setStatuses(prev => ({ ...prev, [nextQId]: 'not-answered' }));
      }
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleMarkForReview = () => {
    const currentQ = test?.questions[currentQuestionIndex];
    if (!currentQ) return;

    const questionId = currentQ.question.id;
    const hasAnswer = !!answers[questionId];

    setStatuses((prev) => ({
      ...prev,
      [questionId]: hasAnswer ? 'answered-marked' : 'marked',
    }));

    if (test && currentQuestionIndex < test.questions.length - 1) {
      const nextQId = test.questions[currentQuestionIndex + 1].question.id;
      if (nextQId && statuses[nextQId] === 'not-visited') {
        setStatuses(prev => ({ ...prev, [nextQId]: 'not-answered' }));
      }
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleClearResponse = () => {
    const currentQ = test?.questions[currentQuestionIndex];
    if (!currentQ) return;

    const questionId = currentQ.question.id;
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
    setStatuses((prev) => ({
      ...prev,
      [questionId]: 'not-answered',
    }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const analysis = useMemo(() => {
    if (!test) return { answered: 0, notAnswered: 0, marked: 0, answeredMarked: 0, notVisited: 0 };
    const counts = {
      answered: 0,
      notAnswered: 0,
      marked: 0,
      answeredMarked: 0,
      notVisited: 0
    };
    test.questions.forEach(q => {
      const status = statuses[q.question.id];
      if (status === 'answered') counts.answered++;
      else if (status === 'not-answered') counts.notAnswered++;
      else if (status === 'marked') counts.marked++;
      else if (status === 'answered-marked') counts.answeredMarked++;
      else counts.notVisited++;
    });
    return counts;
  }, [test, statuses]);

  if (loading || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  const currentTQ = test.questions[currentQuestionIndex];
  const question = currentTQ.question;

  // Grouping questions by topic for the tabs (mocking if only one topic)
  const topics = Array.from(new Set(test.questions.map(q => q.question.topic)));
  const currentTopic = question.topic;

  return (
    <div className="ssc-container">
      {/* Header Top Blue Bar */}
      <div className="bg-[#004ba0] text-white py-1 px-4 text-center font-bold text-sm">
        SSC ONLINE MOCK TEST
      </div>

      {/* Main Header */}
      <header className="ssc-header-top">
        <div className="flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Emblem_of_India.svg/100px-Emblem_of_India.svg.png" alt="Emblem" className="h-12" />
          <div className="font-bold text-lg">SSC-Mock Test</div>
        </div>

        <div className="flex items-center gap-8">
          <div>
            <button className="ssc-zoom-btn">Zoom (+)</button>
            <button className="ssc-zoom-btn">Zoom (-)</button>
          </div>
          
          <div className="ssc-candidate-info">
             Roll No : <span className="font-normal">81533620529</span> [Candidate Name]
          </div>

          <div className="ssc-time-box">
            <span className="ssc-time-left-label">Time Left</span>
            <span className="ssc-time-value">{formatTime(timeLeft)}</span>
          </div>

          <div className="ssc-profile">
            <div className="ssc-profile-img"></div>
            <div className="ssc-profile-img"></div>
          </div>
        </div>
      </header>

      {/* Notice Bar */}
      <div className="ssc-notice-bar">
        <div className="ssc-notice-text">
          Please note that this is only a mock test designed for practice purposes. Some of the questions may be repeated or similar.
        </div>
        <div className="text-red-600 font-bold text-sm mt-1">All questions are auto-saved upon option selection</div>
        <div className="ssc-nav-links">
          <span className="ssc-nav-link">SYMBOLS</span>
          <span className="ssc-nav-link">INSTRUCTIONS</span>
          <span className="ssc-nav-link">OVERALL TEST SUMMARY</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ssc-tabs">
        {topics.map((topic, idx) => (
          <button 
            key={topic} 
            className={`ssc-tab ${topic === currentTopic ? 'active' : ''}`}
            onClick={() => {
              const firstIndex = test.questions.findIndex(q => q.question.topic === topic);
              if (firstIndex !== -1) setCurrentQuestionIndex(firstIndex);
            }}
          >
            PART-{String.fromCharCode(65 + idx)}
          </button>
        ))}
        <div className="ml-auto font-bold text-sm">Total Questions answered: {analysis.answered + analysis.answeredMarked}</div>
      </div>

      {/* Main Body */}
      <main className="ssc-main">
        {/* Left: Question Area */}
        <div className="ssc-question-area">
          <div className="ssc-question-header">
            <div>Question : {currentQuestionIndex + 1}</div>
            <div className="flex items-center gap-2">
               <span className="text-xs font-normal">Select Language:</span>
               <select className="border text-xs p-1">
                 <option>English</option>
                 <option>Hindi</option>
               </select>
            </div>
          </div>

          <div className="ssc-question-text">
            {question.text}
          </div>

          <div className="ssc-options">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optionKey = `option${opt}` as keyof Question;
              const isSelected = answers[question.id] === opt;
              return (
                <label key={opt} className="ssc-option">
                  <input 
                    type="radio" 
                    name={`question-${question.id}`}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(question.id, opt)}
                  />
                  <span>{question[optionKey] as string}</span>
                </label>
              );
            })}
          </div>

          {/* Action Buttons Bottom */}
          <div className="ssc-footer-actions">
            <button className="ssc-btn ssc-btn-blue" onClick={handleMarkForReview}>Mark for Review</button>
            <button className="ssc-btn ssc-btn-gray" onClick={handleClearResponse}>Clear Response</button>
            <div className="ml-auto flex gap-2">
               <button 
                className="ssc-btn ssc-btn-blue"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
               >
                 Previous
               </button>
               <button className="ssc-btn ssc-btn-blue" onClick={handleSaveNext}>Save & Next</button>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
             <button 
              onClick={() => {
                if (confirm('Are you sure you want to submit the test?')) {
                  handleSubmit();
                }
              }}
              disabled={submitting}
              className="ssc-btn ssc-btn-submit"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>

        {/* Right: Sidebar */}
        <aside className="ssc-sidebar">
          <div className="ssc-palette-box">
            <div className="ssc-palette-header">
              {currentTopic}
            </div>
            <div className="ssc-palette-grid">
              {test.questions.map((q, idx) => {
                const status = statuses[q.question.id];
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`ssc-palette-btn ${status} ${currentQuestionIndex === idx ? 'current' : ''}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ssc-analysis-box">
            <div className="ssc-palette-header">
              Analysis
            </div>
            <table className="ssc-analysis-table">
              <tbody>
                <tr>
                  <td className="ssc-analysis-label">Answered</td>
                  <td className="ssc-analysis-value text-green-600">{analysis.answered}</td>
                </tr>
                <tr>
                  <td className="ssc-analysis-label">Not Answered</td>
                  <td className="ssc-analysis-value text-red-600">{analysis.notAnswered}</td>
                </tr>
                <tr>
                  <td className="ssc-analysis-label">Mark for Review</td>
                  <td className="ssc-analysis-value text-blue-600">{analysis.marked}</td>
                </tr>
                <tr>
                  <td className="ssc-analysis-label">Answered & Marked</td>
                  <td className="ssc-analysis-value text-orange-500">{analysis.answeredMarked}</td>
                </tr>
                <tr>
                  <td className="ssc-analysis-label">Not Visited</td>
                  <td className="ssc-analysis-value">{analysis.notVisited}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </aside>
      </main>

      {/* Warning Modal (simplified) */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border-2 border-red-600 p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-red-600 mb-2">Anti-Cheat Warning!</h2>
            <p className="text-sm mb-4">
              We detected you switched tabs or left the browser. Please focus on the test. 
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full bg-blue-800 text-white font-bold py-2"
            >
              Back to Test
            </button>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-gray-300 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 flex flex-col shadow-2xl">
            <div className="bg-[#004ba0] text-white py-2 px-4 text-center font-bold">
              SSC ONLINE MOCK TEST - SYMBOLS & INSTRUCTIONS
            </div>
            <div className="p-6">
               <h3 className="text-blue-800 font-bold text-center mb-4 text-lg">
                 The different symbols used in the next pages are shown below. Please go through them and understand their meaning before you start the test.
               </h3>
               
               <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
                 <thead>
                   <tr className="bg-gray-100">
                     <th className="border border-gray-300 p-2 w-1/4">Symbol</th>
                     <th className="border border-gray-300 p-2 text-left">Description</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td className="border border-gray-300 p-2 text-center">
                        <div className="w-4 h-4 rounded-full border border-gray-400 mx-auto"></div>
                     </td>
                     <td className="border border-gray-300 p-2">Option Not chosen</td>
                   </tr>
                   <tr>
                     <td className="border border-gray-300 p-2 text-center">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center mx-auto">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                     </td>
                     <td className="border border-gray-300 p-2">Option chosen as correct (By clicking on it again you can delete your option and choose another option if desired.)</td>
                   </tr>
                   <tr>
                     <td className="border border-gray-300 p-2 text-center">
                        <div className="ssc-palette-btn not-visited mx-auto">12</div>
                     </td>
                     <td className="border border-gray-300 p-2">Question number shown in white color indicates that you have not yet visited the question.</td>
                   </tr>
                   <tr>
                     <td className="border border-gray-300 p-2 text-center">
                        <div className="ssc-palette-btn not-answered mx-auto">13</div>
                     </td>
                     <td className="border border-gray-300 p-2">Question number shown in red color indicates that you have not yet answered the question.</td>
                   </tr>
                   <tr>
                     <td className="border border-gray-300 p-2 text-center">
                        <div className="ssc-palette-btn answered mx-auto">14</div>
                     </td>
                     <td className="border border-gray-300 p-2">Question number shown in green color indicates that you have answered the question.</td>
                   </tr>
                   <tr>
                     <td className="border border-gray-300 p-2 text-center">
                        <div className="ssc-palette-btn marked mx-auto">15</div>
                     </td>
                     <td className="border border-gray-300 p-2">You have not yet answered the question, but marked it for coming back for review later, if time permits.</td>
                   </tr>
                   <tr>
                     <td className="border border-gray-300 p-2 text-center">
                        <div className="ssc-palette-btn answered-marked mx-auto">16</div>
                     </td>
                     <td className="border border-gray-300 p-2">You have answered the question, but marked it for review later, if time permits.</td>
                   </tr>
                 </tbody>
               </table>

               <div className="space-y-2 text-xs">
                 <div className="flex gap-4">
                   <button className="ssc-btn ssc-btn-blue text-[10px] py-1 px-2 min-w-[100px]">Save & Next</button>
                   <span>Clicking on this will take you to the next question.</span>
                 </div>
                 <div className="flex gap-4">
                   <button className="ssc-btn ssc-btn-blue text-[10px] py-1 px-2 min-w-[100px]">Previous</button>
                   <span>Clicking on this will take you to the previous question.</span>
                 </div>
                 <div className="flex gap-4">
                   <button className="ssc-btn ssc-btn-blue text-[10px] py-1 px-2 min-w-[100px]">Mark for Review</button>
                   <span>By clicking on this button, you can mark the question for review later. Please note that if you answer the question and mark for review, the question will be treated as answered and evaluated even if you do not review it.</span>
                 </div>
                 <div className="flex gap-4">
                   <button className="ssc-btn ssc-btn-gray text-[10px] py-1 px-2 min-w-[100px]">Clear Response</button>
                   <span>By clicking on this button, you can unmark the option for the current question.</span>
                 </div>
               </div>

               <div className="mt-8 flex justify-center gap-4">
                 <button 
                  className="ssc-btn ssc-btn-blue px-8 py-2"
                  onClick={() => setShowInstructions(false)}
                 >
                   &lt;&lt; Back
                 </button>
                 <button 
                  className="ssc-btn ssc-btn-blue px-8 py-2"
                  onClick={() => setShowInstructions(false)}
                 >
                   Continue &gt;&gt;
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
