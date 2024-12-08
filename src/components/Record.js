import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import './Record.css';
import questions from './questions.json';

function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [waveformVisible, setWaveformVisible] = useState(false);
  const [timer, setTimer] = useState(20); // Set timer to 20 seconds
  const [textAreaVisible, setTextAreaVisible] = useState(false); // State to control text area visibility
  const [testStarted, setTestStarted] = useState(false); // State to track if test has started
  const [summaryVisible, setSummaryVisible] = useState(false); // State to control summary visibility
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = isSpeechRecognitionSupported ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSpeechRecognitionSupported(false);
    }
  }, [SpeechRecognition]);

  useEffect(() => {
    setQuestion(questions[currentQuestionIndex]?.question || '');
  }, [currentQuestionIndex, questions]);
  

  const setRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestionIndex(randomIndex);
    setQuestion(questions[randomIndex].question);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };
  

  useEffect(() => {
    let interval = null;
    if (timer > 0 && !isRecording) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, isRecording]);

  const startRecording = async () => {
    if (isRecording) {
      console.warn('Recording is already in progress.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioContextRef.current = new AudioContext();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);

      setWaveformVisible(true);
      drawWaveform();

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(20); // Reset the timer to 20 when recording starts

      if (recognition) {
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          console.log('Speech recognized:', event.results[0][0].transcript);
        };

        recognition.onerror = (error) => {
          console.error('Speech recognition error:', error);
        };

        recognition.start();
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setWaveformVisible(false);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);

    if (recognition) {
      recognition.stop();
    }

    mediaRecorderRef.current.onstop = () => {
      if (audioChunks.current.length > 0) {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        audioChunks.current = [];

        sendAudioToBackend(audioBlob);
      } else {
        console.error('No audio data available to send');
      }
    };
  };

  const sendAudioToBackend = async (audioBlob) => {
    const base64Audio = await convertBlobToBase64(audioBlob);

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/audio/upload-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio }),
        credentials: 'include',
      });

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'Failed to send audio to backend. Please try again.',
        });
        return;
      }

      const responseData = await response.json();

      if (responseData.success) {
        Swal.fire({
          icon: 'success',
          title: 'Audio Processed Successfully',
          text: responseData.message,
        });

        setQuestion(responseData.summary); // Display summary
        setTextAreaVisible(false);
        setSummaryVisible(true); // Show summary
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Processing Failed',
          text: 'The server failed to process the audio.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while sending audio. Please try again.',
      });
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const drawWaveform = () => {
    const canvas = document.getElementById('waveform');
    const canvasContext = canvas.getContext('2d');
    const analyser = analyserRef.current;

    const render = () => {
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      canvasContext.fillStyle = '#1a1a1a';
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = '#4caf50';
      canvasContext.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const handleStartTestClick = () => {
    setTestStarted(true);
    setTextAreaVisible(true);
  };

  const handleEndTestClick = () => {
    setTestStarted(false);
    setTextAreaVisible(false);
    setSummaryVisible(false);
  };

  return (
    <div className="record-container">
      {waveformVisible && <canvas id="waveform" width="600" height="200"></canvas>}

      {!testStarted && (
        <div className="round-button-container">
          <button onClick={handleStartTestClick} className="round-btn">Start Test</button>
        </div>
      )}

      {testStarted && (
        <div className="round-button-container">
          <button onClick={handleEndTestClick} className="round-btn">End Test</button>
        </div>
      )}

      {summaryVisible && (
        <div className="summary-container">
          <h2>Audio Summary</h2>
          <p>{question}</p>
        </div>
      )}

      {textAreaVisible && (
        <div className="text-area-wrapper">
          <button className="arrow-btn left" onClick={handlePreviousQuestion}>{'<'}</button>
          <textarea className="text-area" readOnly value={question}></textarea>
          <button className="arrow-btn right" onClick={handleNextQuestion}>{'>'}</button>
        </div>
      )}

      <div className="buttons-container">
        <button
          onClick={startRecording}
          disabled={isRecording || !isSpeechRecognitionSupported}
          className="start-btn"
        >
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording} className="stop-btn">
          Stop Recording
        </button>
      </div>

      {!isSpeechRecognitionSupported && (
        <p className="error-text">Speech recognition is not supported in your browser.</p>
      )}
    </div>
  );
}

export default Record;
