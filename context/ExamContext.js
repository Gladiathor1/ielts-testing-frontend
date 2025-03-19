import { createContext, useState } from 'react';

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [examType, setExamType] = useState('');
  const [taskNumber, setTaskNumber] = useState('');
  const [questionChoice, setQuestionChoice] = useState('');
  const [testType, setTestType] = useState('writing');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingQuestion, setFetchingQuestion] = useState(false);
  const [imageAndText, setImageAndText] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchResult, setFetchResult] = useState(null);
  const [questionimg, setQuestion] = useState(null);
  const [questionimgPath, setQuestionPath] = useState(null);
  const [manualQues, setManualQues] = useState('');
  const [answer, setAnswer] = useState('');
  const [pdf, setPdf] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState('');
  const [responseText, setResponseText] = useState('');


  return (
      <ExamContext.Provider value={{
          examType, setExamType,
          taskNumber, setTaskNumber,
          questionChoice, setQuestionChoice,
          testType, setTestType,
          error, setError,
          loading, setLoading,
          fetchingQuestion, setFetchingQuestion,
          submitting, setSubmitting,
          fetchResult, setFetchResult,
          questionimg, setQuestion,
          questionimgPath, setQuestionPath,
          answer, setAnswer,
          pdf, setPdf,
          uploadedFile, setUploadedFile,
          fileType, setFileType,
          fileName, setFileName,
          responseText, setResponseText,
          imageAndText, setImageAndText,
          manualQues, setManualQues
      }}>
          {children}
      </ExamContext.Provider>
  );
};