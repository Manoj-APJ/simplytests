import { Request, Response, NextFunction } from 'express';
import * as testService from '../services/test.service';
import { AppError } from '../middleware/error.middleware';

export const getAllTests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tests = await testService.getAllTests();
    res.status(200).json({
      status: 'success',
      data: tests,
    });
  } catch (error) {
    next(error);
  }
};

export const getTestById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const test = await testService.getTestById(id);
    if (!test) {
      throw new AppError('Test not found', 404);
    }
    res.status(200).json({
      status: 'success',
      data: test,
    });
  } catch (error) {
    next(error);
  }
};

export const submitTest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    
    const result = await testService.evaluateTest(id, answers);
    
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
