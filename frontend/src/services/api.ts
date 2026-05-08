import { Test, TestDetail, SubmissionResult } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchTests = async (): Promise<Test[]> => {
  const response = await fetch(`${API_BASE_URL}/tests`);
  if (!response.ok) throw new Error('Failed to fetch tests');
  const result = await response.json();
  return result.data;
};

export const fetchTestById = async (id: string): Promise<TestDetail> => {
  const response = await fetch(`${API_BASE_URL}/tests/${id}`);
  if (!response.ok) throw new Error('Failed to fetch test details');
  const result = await response.json();
  return result.data;
};

export const submitTest = async (id: string, answers: Record<string, string>): Promise<SubmissionResult> => {
  const response = await fetch(`${API_BASE_URL}/tests/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) throw new Error('Failed to submit test');
  const result = await response.json();
  return result.data;
};
