import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import axiosInstance from '../utils/axiosConfig'
import { checkTokenValidity } from '../utils/checkToken'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchingQuestion, setFetchingQuestion] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fetchResult, setFetchResult] = useState(null)
  const [chooseexamType, setExamType] = useState(null)
  const [taskNumber, setTaskNumber] = useState(0)
  const [chooseQuesSelected, setChooseQuesSelected] = useState(false)
  const [chooseQuesUpload, setChooseQuesUpload] = useState(false)
  const [questionimg, setQuestion] = useState(null)
  const [questionimgPath, setQuestionPath] = useState(null)
  const [answer, setAnswer] = useState('')
  const [pdf, setPdf] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState('');

  
  
  useEffect(() => {
    checkTokenValidity(setLoading)
    console.log('Choose Exam Type:', chooseexamType)
    console.log('Task Number:', taskNumber)
    console.log('Choose Ques Selected:', chooseQuesSelected)
  }, [chooseexamType, taskNumber, chooseQuesSelected])

  if (loading) {
    return <div>Loading...</div>
  }

  const fetchQuestion = async () => {
    setFetchingQuestion(true)
    setError(null)
    
    try {
      const response = await axiosInstance.post('/api/users/get-question/', {
        exam_type: chooseexamType,
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

  const submitAnswer = async () => {
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await axiosInstance.post('/api/users/submit-answer/', {
        answer_text: answer,
        image_base64: questionimg,
        image_path: questionimgPath
      })

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


//   const handleDownloadPdf = () => {
//     const link = document.createElement('a')
//     link.href = `data:application/pdf;base64,${pdf}`
//     link.download = 'result.pdf'
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     // setPdf(null)
//     if (taskNumber === 1) {
//       setTaskNumber(2)
//     }
//   }


  const handleExamType = (number) => {
    if(number === 0) {
        setExamType(null)
    }
    else if(number === 1) {
        setExamType('ac')
    }
    else if(number === 2) {
        setExamType('ge')
    }
    
  }
  const handleTaskNumber = (number) => {
    setTaskNumber(number)
    
  }
  const handleChooseQuesSelected = (val) => {
    if(val === true) {
        setChooseQuesSelected(1)
        fetchQuestion()
    }
    
  }
  const handleChooseQuesUpload = (val) => {
    if(val === true) {
        setChooseQuesUpload(1)
    }
    
  }

    const renderTaskComponent = () => (
    
    <div className="min-h-screen bg-gray-50 py-12 px-4">

        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Homepage</h1>
        <a onClick={() => handleExamType(0)} href="#" className="go-back-button"> {"< Go Back"}</a>

            
            <div className="space-y-4">
            <div>
                <label>Exam Type:</label>
                <select
                value={chooseexamType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full mt-2 p-2 border rounded"
                >
                <option value="ac">Advanced Course (ac)</option>
                <option value="bc">Basic Course (bc)</option>
                </select>
            </div>
            <button
                onClick={fetchQuestion}
                disabled={fetchingQuestion || taskNumber > 2}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
                {fetchingQuestion ? 'Fetching Question...' : `Fetch Task ${taskNumber} Question`}
            </button>

            {questionimg && (
                <div>
                <img src={`data:image/png;base64,${questionimg}`} alt="Question" />
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full mt-4 p-2 border rounded"
                />
                <button
                    onClick={submitAnswer}
                    disabled={submitting}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 mt-4"
                >
                    {submitting ? 'Submitting Answer...' : 'Submit Answer'}
                </button>
                {submitting && <div className="loader mt-4"></div>}
                </div>
            )}

            {fetchResult && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
                <h2 className="font-bold mb-2">Results:</h2>
                <p>{fetchResult}</p>
                {pdf && (
                    <button
                    onClick={handleDownloadPdf}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-4"
                    >
                    Download PDF
                    </button>
                )}
                </div>
            )}

            <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 mt-4"
            >
                Logout
            </button>
            </div>

            {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
            </div>
            )}
        </div>
        </div>
  )



  const renderTaskNumberComponent = () => (
    <div className="container body-padding">   
        <div className="exam-select">
        <a onClick={() => handleExamType(0)} href="#" className="go-back-button"> {"< Go Back"}</a>
            <p>Choose Your Task</p>
            <div className="exam-select-buttons">
            <a href="#" className="exam-select-button" onClick={() => handleTaskNumber(1)}>
                <span>Task 1</span>
            </a>
            <a href="#" className="exam-select-button" onClick={() => handleTaskNumber(2)}>
                <span><span>Task 2</span></span>
            </a>
            </div>
        </div>
    </div>
  )

  const renderChooseQuesComponent = () => (
    <div className="container body-padding">   
        <div className="exam-select">
        <a onClick={() => handleTaskNumber(0)} href="#" className="go-back-button"> {"< Go Back"}</a>
            <p>Choose Your Question</p>
            <div className="exam-select-buttons">
            <a onClick={() => handleChooseQuesUpload(true)} href="#" className="exam-select-button flex-dir-c">
                <svg className='fill-414141' width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 16.0008C1.95 16.0008 1.47933 15.8051 1.088 15.4138C0.696666 15.0225 0.500667 14.5515 0.5 14.0008V12.0008C0.5 11.7175 0.596 11.4801 0.788 11.2888C0.98 11.0975 1.21733 11.0015 1.5 11.0008C1.78267 11.0001 2.02033 11.0961 2.213 11.2888C2.40567 11.4815 2.50133 11.7188 2.5 12.0008V14.0008H14.5V12.0008C14.5 11.7175 14.596 11.4801 14.788 11.2888C14.98 11.0975 15.2173 11.0015 15.5 11.0008C15.7827 11.0001 16.0203 11.0961 16.213 11.2888C16.4057 11.4815 16.5013 11.7188 16.5 12.0008V14.0008C16.5 14.5508 16.3043 15.0218 15.913 15.4138C15.5217 15.8058 15.0507 16.0015 14.5 16.0008H2.5ZM7.5 3.8508L5.625 5.7258C5.425 5.9258 5.18767 6.0218 4.913 6.0138C4.63833 6.0058 4.40067 5.90146 4.2 5.7008C4.01667 5.5008 3.92067 5.26746 3.912 5.0008C3.90333 4.73413 3.99933 4.5008 4.2 4.3008L7.8 0.700796C7.9 0.600796 8.00833 0.53013 8.125 0.488796C8.24167 0.447463 8.36667 0.426463 8.5 0.425797C8.63333 0.42513 8.75833 0.44613 8.875 0.488796C8.99167 0.531463 9.1 0.60213 9.2 0.700796L12.8 4.3008C13 4.5008 13.096 4.73413 13.088 5.0008C13.08 5.26746 12.984 5.5008 12.8 5.7008C12.6 5.9008 12.3627 6.00513 12.088 6.0138C11.8133 6.02246 11.5757 5.92646 11.375 5.7258L9.5 3.8508V11.0008C9.5 11.2841 9.404 11.5218 9.212 11.7138C9.02 11.9058 8.78267 12.0015 8.5 12.0008C8.21733 12.0001 7.98 11.9041 7.788 11.7128C7.596 11.5215 7.5 11.2841 7.5 11.0008V3.8508Z"/>
                </svg>
                <span>I have my <br></br>own question</span>
            </a>
            <a href="#" className="exam-select-button flex-dir-c" onClick={() => handleChooseQuesSelected(true)}>
                <svg className='fill-414141' width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.50039 11.1013L3.87039 13.2933C3.76372 13.3459 3.66472 13.3673 3.57339 13.3573C3.48272 13.3466 3.39439 13.3153 3.30839 13.2633C3.22172 13.2099 3.15639 13.1346 3.11239 13.0373C3.06839 12.9399 3.06439 12.8336 3.10039 12.7183L4.06639 8.60828L0.871391 5.83828C0.781391 5.76495 0.722057 5.67728 0.693391 5.57528C0.664724 5.47328 0.671057 5.37561 0.712391 5.28228C0.753724 5.18895 0.808724 5.11228 0.877391 5.05228C0.946724 4.99428 1.04006 4.95495 1.15739 4.93428L5.37339 4.56628L7.01739 0.674282C7.06272 0.564282 7.12806 0.484948 7.21339 0.436281C7.29872 0.387615 7.39439 0.363281 7.50039 0.363281C7.60639 0.363281 7.70239 0.387615 7.78839 0.436281C7.87439 0.484948 7.93939 0.564282 7.98339 0.674282L9.62739 4.56628L13.8424 4.93428C13.9604 4.95428 14.0541 4.99395 14.1234 5.05328C14.1927 5.11195 14.2481 5.18828 14.2894 5.28228C14.3301 5.37561 14.3361 5.47328 14.3074 5.57528C14.2787 5.67728 14.2194 5.76495 14.1294 5.83828L10.9344 8.60828L11.9004 12.7183C11.9377 12.8323 11.9341 12.9383 11.8894 13.0363C11.8447 13.1343 11.7791 13.2096 11.6924 13.2623C11.6071 13.3156 11.5187 13.3473 11.4274 13.3573C11.3367 13.3673 11.2381 13.3459 11.1314 13.2933L7.50039 11.1013Z" />
                </svg>
                <span>Choose One</span>
            </a>
            </div>
        </div>
    </div>
  )

  const renderQuesComponent = () => (
    <div className="ques-ans-container body-padding">   
        <div className="ques-ans-div">
            <div className="ques-div">
                <p>Your Question</p>
                {fetchingQuestion ? 'Fetching Question...' : (
                    questionimg && (
                        <img src={`data:image/png;base64,${questionimg}`} alt="Question" />
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
                <a href="#" className="submit-button" onClick={submitAnswer}>Submit Your Answer</a>
                {submitting ? 'Submitting Answer...' : <></>}
            </div>
        </div>
    </div>
  )


  const renderUploadQuesComponent = () => (
    <div className="container body-padding">   
        <div className="exam-select">
            <div className='paste-ques-div'>
                <p className='margin-0'>Paste your Question or upload an image/pdf</p>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your Question here..."
                />
                <div className='upload-file-container'>
                <label>
                    <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleFileUpload}
                    className="hidden"
                    />
                    <div className="flex flex-col items-center">
                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 16.075C1.45 16.075 0.979333 15.8793 0.588 15.488C0.196666 15.0967 0.000666667 14.6257 0 14.075V12.075C0 11.7917 0.0960001 11.5543 0.288 11.363C0.48 11.1717 0.717333 11.0757 1 11.075C1.28267 11.0743 1.52033 11.1703 1.713 11.363C1.90567 11.5557 2.00133 11.793 2 12.075V14.075H14V12.075C14 11.7917 14.096 11.5543 14.288 11.363C14.48 11.1717 14.7173 11.0757 15 11.075C15.2827 11.0743 15.5203 11.1703 15.713 11.363C15.9057 11.5557 16.0013 11.793 16 12.075V14.075C16 14.625 15.8043 15.096 15.413 15.488C15.0217 15.88 14.5507 16.0757 14 16.075H2ZM7 3.92502L5.125 5.80002C4.925 6.00002 4.68767 6.09601 4.413 6.08801C4.13833 6.08001 3.90067 5.97568 3.7 5.77501C3.51667 5.57502 3.42067 5.34168 3.412 5.07502C3.40333 4.80835 3.49933 4.57502 3.7 4.37502L7.3 0.775015C7.4 0.675015 7.50833 0.604348 7.625 0.563015C7.74167 0.521682 7.86667 0.500682 8 0.500015C8.13333 0.499349 8.25833 0.520348 8.375 0.563015C8.49167 0.605682 8.6 0.676348 8.7 0.775015L12.3 4.37502C12.5 4.57502 12.596 4.80835 12.588 5.07502C12.58 5.34168 12.484 5.57502 12.3 5.77501C12.1 5.97501 11.8627 6.07935 11.588 6.08801C11.3133 6.09668 11.0757 6.00068 10.875 5.80002L9 3.92502V11.075C9 11.3583 8.904 11.596 8.712 11.788C8.52 11.98 8.28267 12.0757 8 12.075C7.71733 12.0743 7.48 11.9783 7.288 11.787C7.096 11.5957 7 11.3583 7 11.075V3.92502Z" fill="#121212"/>
                    </svg>
                    <p className="upload-text">Upload</p>
                    <p className="max-size-text">100KB max size</p>
                    </div>
                    {fileName && (
                        <p className="max-size-text">Selected file: {fileName}</p>
                    )}
                </label>
                </div>
                {uploadedFile && (
                    <a href="#" className="submit-button" onClick={submitAnswer}>Next</a>
                )}
                
            </div>
        </div>
    </div>
  )


  const renderResultComponent = () => (
    <div className="ques-ans-container body-padding">   
        <div className="ques-ans-div">
            <div className="ques-div">
                <p>Your Result:</p>
                {fetchResult}
            </div>
            <div className="ans-div flex-center">
            {pdf && (
                <>
                <p>Download My Result</p>
                    <svg width="104" height="121" viewBox="0 0 104 121" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 52.5V48.5H8V52.5H12ZM44 52.5V48.5H40V52.5H44ZM44 84.5H40V88.5H44V84.5ZM100 28.5H104V26.844L102.832 25.668L100 28.5ZM76 4.5L78.832 1.668L77.656 0.5H76V4.5ZM12 56.5H20V48.5H12V56.5ZM16 88.5V68.5H8V88.5H16ZM16 68.5V52.5H8V68.5H16ZM20 64.5H12V72.5H20V64.5ZM24 60.5C24 61.5609 23.5786 62.5783 22.8284 63.3284C22.0783 64.0786 21.0609 64.5 20 64.5V72.5C23.1826 72.5 26.2348 71.2357 28.4853 68.9853C30.7357 66.7348 32 63.6826 32 60.5H24ZM20 56.5C21.0609 56.5 22.0783 56.9214 22.8284 57.6716C23.5786 58.4217 24 59.4391 24 60.5H32C32 57.3174 30.7357 54.2652 28.4853 52.0147C26.2348 49.7643 23.1826 48.5 20 48.5V56.5ZM40 52.5V84.5H48V52.5H40ZM44 88.5H52V80.5H44V88.5ZM64 76.5V60.5H56V76.5H64ZM52 48.5H44V56.5H52V48.5ZM64 60.5C64 57.3174 62.7357 54.2652 60.4853 52.0147C58.2349 49.7643 55.1826 48.5 52 48.5V56.5C53.0609 56.5 54.0783 56.9214 54.8284 57.6716C55.5786 58.4217 56 59.4391 56 60.5H64ZM52 88.5C55.1826 88.5 58.2349 87.2357 60.4853 84.9853C62.7357 82.7348 64 79.6826 64 76.5H56C56 77.5609 55.5786 78.5783 54.8284 79.3284C54.0783 80.0786 53.0609 80.5 52 80.5V88.5ZM72 48.5V88.5H80V48.5H72ZM76 56.5H96V48.5H76V56.5ZM76 72.5H88V64.5H76V72.5ZM8 40.5V12.5H0V40.5H8ZM96 28.5V40.5H104V28.5H96ZM12 8.5H76V0.5H12V8.5ZM73.168 7.332L97.168 31.332L102.832 25.668L78.832 1.668L73.168 7.332ZM8 12.5C8 11.4391 8.42143 10.4217 9.17157 9.67157C9.92172 8.92143 10.9391 8.5 12 8.5V0.5C8.8174 0.5 5.76516 1.76428 3.51472 4.01472C1.26428 6.26515 0 9.3174 0 12.5H8ZM0 96.5V108.5H8V96.5H0ZM12 120.5H92V112.5H12V120.5ZM104 108.5V96.5H96V108.5H104ZM92 120.5C95.1826 120.5 98.2349 119.236 100.485 116.985C102.736 114.735 104 111.683 104 108.5H96C96 109.561 95.5786 110.578 94.8284 111.328C94.0783 112.079 93.0609 112.5 92 112.5V120.5ZM0 108.5C0 111.683 1.26428 114.735 3.51472 116.985C5.76516 119.236 8.8174 120.5 12 120.5V112.5C10.9391 112.5 9.92172 112.079 9.17157 111.328C8.42143 110.578 8 109.561 8 108.5H0Z" fill="#4F4F4F"/>
                </svg>
                <a href={`data:application/pdf;base64,${pdf}`} className="submit-button" download="result.pdf">Download</a>
                </>
            )}
            </div>
        </div>
    </div>
  )

  return (
    <>
        {fetchResult ? renderResultComponent() : chooseQuesSelected ? renderQuesComponent() : chooseQuesUpload ? renderUploadQuesComponent() : taskNumber !== 0 ? (
            renderChooseQuesComponent()
            ) : chooseexamType === 'ac' || chooseexamType === 'ge' ? (
            renderTaskNumberComponent()
            ) :   (
        <>
        <div className="container body-padding">   
            <div className="exam-select">
                <p>Choose Your Path</p>
                <div className="exam-select-buttons">
                <a href="#" className="exam-select-button" onClick={() => handleExamType(1)}>
                    <span>Academic<br></br>IELTS</span>
                </a>
                <a href="#" className="exam-select-button" onClick={() => handleExamType(2)}>
                    <span>General<br></br>IELTS</span>
                </a>
                </div>
            </div>
        </div>
        </>
      )}
    </>

  )
}