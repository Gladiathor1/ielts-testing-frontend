import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import axiosInstance from '../utils/axiosConfig'
import { checkTokenValidity } from '../utils/checkToken'
import { useContext } from 'react';
import { ExamContext } from '../context/ExamContext';
import Image from 'next/image'
import Link from 'next/link';

export default function Home() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const { examType, setExamType,
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
    responseText, setResponseText } = useContext(ExamContext);
  

  
    const fetchQuestion = async () => {
      setFetchingQuestion(true)
      setError(null)
      
  
      try {
        const response = await axiosInstance.post('/api/users/get-question/', {
          exam_type: examType,
          task_number: taskNumber
        })
  
        const { question, question_path } = response.data
        console.log('Question:', question)
        console.log('Question Path:', question_path)
        setQuestion(question)
        setQuestionPath(question_path)
        setPdf(null)
      } catch (error) {
        console.error('Error fetching question:', error)
        setError(error.response?.data?.detail || error.message)
      } finally {
        setFetchingQuestion(false)
      }
    }

    useEffect(() => {
      checkTokenValidity(setLoading)
      console.log('Choose Exam Type:', examType)
      console.log('Task Number:', taskNumber)
      console.log('Question Choice:', questionChoice)
      console.log('Test Type:', testType)
      if (!examType || !taskNumber || !questionChoice || !testType) {
        router.push('/')
        return
      }
      else if(Number(questionChoice)===2){
        fetchQuestion()
      }
    }, [examType, taskNumber, questionChoice, testType, router, setLoading])

  if (loading) {
    return <div>Loading...</div>
  }

  

  const submitAnswer = async () => {
    setSubmitting(true)
    setError(null)
    console.log("exam_type", examType)
    console.log("task_number", taskNumber)
    
    try {
      const payload = {
        exam_type: examType,
        task_number: taskNumber,
        answer_text: answer,
        // image_base64: questionimg,
        image_path: questionimgPath
      };
  
      if (responseText) {
        payload.question_explanation = responseText;
        payload.custom_question = 1;
        payload.image_path = questionimg;
        payload.file_type= fileType;
      }
  
      const response = await axiosInstance.post('/api/users/submit-answer/', payload);

      const { results, pdf } = response.data
      console.log('Results:', results);
      console.log('PDF:', pdf);  
      setFetchResult(results)
      setPdf(pdf)
    } catch (error) {
      console.error('Error submitting answer:', error)
      setError(error.response?.data?.detail || error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFile(reader.result);
        setFileType(file.type);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    const refreshToken = Cookies.get('refreshToken')
    if (!refreshToken) {
      router.push('/login')
      return
    }

    try {
      const token = Cookies.get('accessToken')
      if (!token) {
        throw new Error('No access token found')
      }

      console.log('Logging out with refresh token:', refreshToken)

      await axiosInstance.post('/api/users/logout/', {
        refresh: refreshToken
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      Cookies.remove('accessToken')
      Cookies.remove('refreshToken')
      Cookies.remove('sessionCode')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setError(error.response?.data?.detail || error.message)
    }
  }

  const renderQuesComponent = () => (
    <div className="ques-ans-div">
            <div className="ques-div">
                <p>Your Question</p>
                {fetchingQuestion ? 'Fetching Question...' : (
                    questionimg && (
                        <img src={questionimg} alt="Question" />
                    )
                )}
            </div>
            <div className="ans-div">
                <p>Your Answer</p>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                />
                {/* <a href="#" className="submit-button" onClick={submitAnswer}>Submit Your Answer</a> */}
                {!submitting ? <a href="#" className="submit-button" onClick={submitAnswer}>Submit Your Answer</a> :'Submitting Answer...'}
            </div>
        </div>
  )
  const renderResultComponent = () => (
    <div className="result-div">
      <p>Download Your Result</p>
      <div className="result-img">
        <Image src='/images/pdf logo.png' alt='pdf' width={104} height={120}/>
      </div>
      <div className="button-container">
        <Link href="/" passHref>
          <span className="button">Start Again</span>
        </Link>
        {pdf && (
          <a href={`data:application/pdf;base64,${pdf}`} download="result.pdf" className="button button-black">Download</a>
        )}
      </div>
    </div>
  )
  

  return (
    <div className="container">   
    <div className='header-bar'>
            <Image src='/images/ielts testing Logo.png' alt='logo' width={145} height={83}/>
          </div>
        {fetchResult ? renderResultComponent() : renderQuesComponent()}
    </div>

  )
}