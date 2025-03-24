import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useContext } from 'react';
import { ExamContext } from '../context/ExamContext';
import Cookies from 'js-cookie'
import axiosInstance from '../utils/axiosConfig'
import { checkTokenValidity } from '../utils/checkToken'
import Image from 'next/image'
import Link from 'next/link';

export default function Home() {
  const router = useRouter()
  const { examType, setExamType,
    taskNumber, setTaskNumber,
    questionChoice, setQuestionChoice,
    testType, setTestType,
    error, setError,
    loading, setLoading,
    uploadedFile, setUploadedFile,
    fileType, setFileType,
    fileName, setFileName,
    questionimg, setQuestion,
    questionimgPath, setQuestionPath,
    manualQues, setManualQues,
    responseText, setResponseText,
    imageAndText, setImageAndText  } = useContext(ExamContext);
    const [choiceError, setChoiceError] = useState(null);
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
  
  useEffect(() => {
    checkTokenValidity(setLoading)
    console.log('exam type:', examType);
    console.log('task number:', taskNumber);
    console.log('question choice:', questionChoice);
    console.log('test type:', testType);
  }, [examType, taskNumber, questionChoice, testType, setLoading])

  if (loading) {
    return <div>Loading...</div>
  }

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

  const handleSubmit = () => {
    let errorMessage = '';
  
    if (!taskNumber) {
      errorMessage += 'Task number is required. ';
    }
    if (!examType) {
      errorMessage += 'Exam type is required. ';
    }
    if (!testType) {
      errorMessage += 'Test type is required. ';
    }
    if (!questionChoice) {
      errorMessage += 'Question choice is required. ';
    }
  
    if (errorMessage) {
      setChoiceError(errorMessage.trim());
    } else {
      router.push('/test');
    }
  };

  const handleFileUpload = (file) => {
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

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleLetFaithDecide = () => {
    setQuestionChoice(2);
    setManualQues('');
    router.push('/test');
  };

  const handleNextClick = async () => {
    console.log('uploaded file:', uploadedFile);
    console.log('file type:', fileType);
    console.log('file name:', fileName);
    console.log('manual ques:', manualQues);
    console.log('image and text:', imageAndText);
    if(manualQues && !uploadedFile){
      handleYesClick();
      return;
    }
    else{
      try {
        const response = await axiosInstance.post('/api/users/upload-question/', {
          exam_type: examType,
          task_number: taskNumber,
          file_base64: uploadedFile,
          file_type: fileType
        });
        const { results } = response.data;
        setResponseText(results);
      } catch (error) {
        console.error('File upload error:', error);
        setError(error.response?.data?.detail || error.message);
      }
    }
  };

  const handleYesClick = async () => {
    setQuestionPath("manual");
    setQuestion(uploadedFile)
    router.push('/test')
  };

  const handleCheckboxChange = (event) => {
    setImageAndText(event.target.checked);
  };

  const handleEditClick = () => {
    setResponseText('');
    setUploadedFile(null);
    setFileType(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container">
      <div className='header-bar'>
      <Link href="/" passHref>
        <Image src='/images/ielts testing Logo.png' alt='logo' width={145} height={83}/>
        </Link>
      </div>
      <div className="test-select mrg-l-100">
        <p>Know Your Score!</p>
        <div className="test-select-buttons">
          <div className="test-select-button hover-change active no-cursor">
            {testType === "writing" ? <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.8434 8.15738C17.9604 8.22497 18.0629 8.31496 18.1451 8.42219C18.2273 8.52943 18.2876 8.65182 18.3225 8.78236C18.3574 8.9129 18.3662 9.04903 18.3485 9.18299C18.3308 9.31694 18.2868 9.44609 18.2191 9.56305L13.5331 17.6721C13.466 17.79 13.3763 17.8935 13.2691 17.9766C13.1619 18.0597 13.0393 18.1208 12.9084 18.1563C12.7775 18.1919 12.6409 18.2012 12.5064 18.1837C12.3719 18.1662 12.2421 18.1223 12.1247 18.0545C12.0072 17.9866 11.9043 17.8963 11.8219 17.7885C11.7395 17.6807 11.6792 17.5578 11.6446 17.4266C11.6099 17.2955 11.6015 17.1588 11.6199 17.0244C11.6383 16.89 11.683 16.7606 11.7516 16.6435L16.4391 8.53314C16.5756 8.29721 16.8001 8.12512 17.0635 8.05466C17.3268 7.98421 17.6073 8.02115 17.8434 8.15738Z" fill="white"/>
            <path d="M16.5988 1.23384C17.3469 0.661687 18.291 0.408772 19.225 0.530318C19.6295 0.585174 19.9957 0.726427 20.3605 0.903336C20.7088 1.07476 21.1148 1.30927 21.6002 1.58903L21.6592 1.62332C22.1433 1.90171 22.5506 2.13759 22.8729 2.35427C23.2089 2.57918 23.5161 2.82466 23.7643 3.14968C24.3389 3.89708 24.5926 4.8406 24.4692 5.77452C24.4067 6.17081 24.2803 6.55431 24.0948 6.91003C23.9247 7.25836 23.6889 7.6643 23.4091 8.1484L16.3793 20.3126C15.9351 21.1197 15.2644 21.779 14.4498 22.2093L11.8976 23.6245C11.4451 23.8755 11.0474 24.0963 10.71 24.2444C10.4822 24.3497 10.2422 24.4262 9.99551 24.4721C9.91693 24.4882 9.83708 24.4974 9.75689 24.4995H1.52854C1.25576 24.4995 0.994143 24.3911 0.801253 24.1982C0.608364 24.0054 0.5 23.7437 0.5 23.471C0.5 23.1982 0.608364 22.9366 0.801253 22.7437C0.994143 22.5508 1.25576 22.4424 1.52854 22.4424H7.4749L7.46667 22.3738C7.43026 21.9291 7.41196 21.483 7.41181 21.0367L7.36244 18.1198C7.32715 17.1996 7.5627 16.2893 8.03991 15.5018L15.071 3.33756C15.3494 2.85345 15.5853 2.44615 15.802 2.12387C16.0283 1.78788 16.2737 1.48206 16.5974 1.23247M18.9548 2.56821C18.5613 2.51757 18.1637 2.62399 17.8481 2.86443C17.7754 2.92065 17.6739 3.02214 17.5066 3.27173C17.3113 3.57368 17.1252 3.88147 16.9485 4.19468L16.9786 4.20565C17.5053 4.41136 18.2924 4.77615 19.4197 5.42619C20.5319 6.068 21.2286 6.62204 21.6633 7.05403C21.9348 6.58501 22.1186 6.26411 22.2462 6.00354C22.3778 5.73338 22.4162 5.59624 22.4285 5.50435C22.4781 5.11221 22.3717 4.71629 22.1323 4.40176C22.0761 4.3277 21.9746 4.22759 21.725 4.05891C21.3569 3.82377 20.9819 3.59968 20.6005 3.38693C20.0794 3.08522 19.7324 2.88637 19.454 2.7506C19.1838 2.61895 19.0467 2.58055 18.9548 2.56821ZM20.462 8.77787L20.4661 8.78884L20.4867 8.82998L20.4839 8.82586L20.4592 8.77101L20.462 8.77787ZM20.4592 8.77101L20.4579 8.76552V8.76827M20.4757 8.81352C20.4068 8.71747 20.3297 8.62754 20.2453 8.54473C19.971 8.26634 19.4225 7.80418 18.3912 7.20762C17.3325 6.59735 16.6385 6.28193 16.2299 6.12148C16.1219 6.07917 16.0126 6.04029 15.9021 6.00491L9.81997 16.5303C9.52991 16.9944 9.38918 17.5362 9.41679 18.0828L9.46204 20.7542C10.134 20.8502 10.7292 21.1917 11.1516 21.684L13.4514 20.4086C13.9393 20.1599 14.339 19.7673 14.5965 19.2841L20.5621 8.96163C20.5335 8.9179 20.5074 8.87257 20.4839 8.82586L20.4757 8.81352Z" fill="white"/>
            </svg>
            : <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.12443 19C6.31457 19 6.35259 18.981 6.52372 18.943L9.94616 18.2591C10.3074 18.1641 10.6687 17.9932 10.9539 17.7082L19.2438 9.42565C20.5177 8.15286 20.5177 5.96824 19.2438 4.69546L18.5403 3.95459C17.2664 2.6818 15.0608 2.6818 13.7869 3.95459L5.49698 12.2562C5.23079 12.5221 5.04066 12.902 4.94559 13.263L4.22307 16.7204C4.12801 17.3663 4.31814 17.9932 4.77447 18.4491C5.13573 18.81 5.66811 19 6.12443 19ZM6.77089 13.6239L15.0608 5.32235C15.6122 4.77145 16.6199 4.77145 17.1523 5.32235L17.8748 6.04423C18.5213 6.69012 18.5213 7.60196 17.8748 8.22885L9.60391 16.5304L6.0864 17.1193L6.77089 13.6239Z"/>
            <path d="M19.2603 20H5.11898C4.56329 20 4.19922 20.3958 4.19922 21C4.19922 21.6042 4.6591 22 5.11898 22H19.1837C19.7393 22 20.1992 21.6042 20.1992 21C20.1801 20.3958 19.7202 20 19.2603 20Z" />
            </svg>}
            
            <span>Writing</span>
          </div>
          
        </div>
        {/* <div className='upload-ques-section'>
            <h4>Provide Your Question</h4> */}
            <div className='paste-ques-div'>
            {examType === 'ac' && taskNumber === '1' ? (
              <p className='margin-0'>Provide Your Question</p>
              
            ) : (
              <>
                <p className='margin-0'>Add Your Question</p>
                <textarea
                  value={manualQues}
                  onChange={(e) => setManualQues(e.target.value)}
                  placeholder="Type your Question here..."
                />
                <p className='or-para'>OR</p>
              </>
            )}
            <div className='upload-file-img-container'>
                <div 
                  className={`upload-file-container ${dragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                <label>
                    <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleFileInputChange}
                    className="hidden"
                    ref={fileInputRef}
                    />
                    <div className="flex flex-col items-center">
                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 16.075C1.45 16.075 0.979333 15.8793 0.588 15.488C0.196666 15.0967 0.000666667 14.6257 0 14.075V12.075C0 11.7917 0.0960001 11.5543 0.288 11.363C0.48 11.1717 0.717333 11.0757 1 11.075C1.28267 11.0743 1.52033 11.1703 1.713 11.363C1.90567 11.5557 2.00133 11.793 2 12.075V14.075H14V12.075C14 11.7917 14.096 11.5543 14.288 11.363C14.48 11.1717 14.7173 11.0757 15 11.075C15.2827 11.0743 15.5203 11.1703 15.713 11.363C15.9057 11.5557 16.0013 11.793 16 12.075V14.075C16 14.625 15.8043 15.096 15.413 15.488C15.0217 15.88 14.5507 16.0757 14 16.075H2ZM7 3.92502L5.125 5.80002C4.925 6.00002 4.68767 6.09601 4.413 6.08801C4.13833 6.08001 3.90067 5.97568 3.7 5.77501C3.51667 5.57502 3.42067 5.34168 3.412 5.07502C3.40333 4.80835 3.49933 4.57502 3.7 4.37502L7.3 0.775015C7.4 0.675015 7.50833 0.604348 7.625 0.563015C7.74167 0.521682 7.86667 0.500682 8 0.500015C8.13333 0.499349 8.25833 0.520348 8.375 0.563015C8.49167 0.605682 8.6 0.676348 8.7 0.775015L12.3 4.37502C12.5 4.57502 12.596 4.80835 12.588 5.07502C12.58 5.34168 12.484 5.57502 12.3 5.77501C12.1 5.97501 11.8627 6.07935 11.588 6.08801C11.3133 6.09668 11.0757 6.00068 10.875 5.80002L9 3.92502V11.075C9 11.3583 8.904 11.596 8.712 11.788C8.52 11.98 8.28267 12.0757 8 12.075C7.71733 12.0743 7.48 11.9783 7.288 11.787C7.096 11.5957 7 11.3583 7 11.075V3.92502Z" fill="#121212"/>
                    </svg>
                    <p className="upload-text">Upload an image</p>
                    <p className="max-size-text">jpg, png, txt, docx, pdf</p>
                    </div>
                    {fileName && (
                        <p className="max-size-text">Selected file: {fileName}</p>
                    )}
                </label>
                </div>
                <Image className='arrow-image' src='/images/drag image pointer.png' alt='logo' width={283} height={111}/>
                <Image className='blur-img' src='/images/your ques blur.png' alt='logo' width={579} height={461}/>
                </div>
                {uploadedFile || manualQues ? (
                    <div onClick={handleNextClick} className="submit-button-black">Next</div>
                ):<></>}

                {examType === 'ac' && taskNumber === '1' ? <></>:
                <div className="checkbox-container">
                  <label>
                    <input
                      type="checkbox"
                      onChange={handleCheckboxChange}
                    />
                      I want to use both image and text for my question 
                    <br/>
                    <span className='note-text'>
                    ** note if this is uncheked only the text or image will be used basef on what you select, if both fields are filled and this option is not selected then the image will be used
                    </span>
                  </label>
                </div>}
                
                <p className='special-text'>Or <span className='inner' onClick={handleLetFaithDecide}>Let Faith Decide</span></p>

                
            </div>
            
            {responseText && (
                <div className="popup-container">
                    <div className="popup-content">
                      <div className='response-text-container'>
                      <p>{responseText}</p>
                      </div>
                      <h3>Is This Transcript Correct?</h3>
                      <div className="button-container">
                      <a onClick={handleYesClick} className="button">Yes</a>
                      <a onClick={handleEditClick} className="button button-black">Edit</a>
                      </div>
                      <p className='special-text'>Or <span className='inner' onClick={handleLetFaithDecide}>Let Faith Decide</span></p>
                    </div>
                </div>
            )}

        {/* </div> */}
        {/* {choiceError && <div className="error-message">{choiceError}</div>}
        <div className='test-select-submit-button' onClick={handleSubmit}>Start Your Test</div> */}
      </div>
    </div>

  )
}