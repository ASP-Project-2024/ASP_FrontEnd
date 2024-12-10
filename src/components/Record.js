import React, { useState, useRef, useEffect } from 'react';
import './Record.css';
import questions from './questions.json';

function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [backendResponse, setBackendResponse] = useState(null);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [waveformVisible, setWaveformVisible] = useState(false);
  const [timer, setTimer] = useState(20); // Set timer to 20 seconds
  const [textAreaVisible, setTextAreaVisible] = useState(false); // State to control text area visibility
  const [testStarted, setTestStarted] = useState(false); // State to track if test has started
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
    // Set a random question from the imported JSON data
    if (questions.length > 0) {
      setRandomQuestion();
    } else {
      console.error('No questions found in the JSON file');
    }
  }, [])

  // Function to set a random question
  const setRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestionIndex(randomIndex);
    setQuestion(questions[randomIndex].question);
  };

  // Function to handle getting a new random question
  const handleGetNewRandomQuestion = () => {
    setRandomQuestion();
  };

  useEffect(() => {
    // Set the first question from the imported JSON data
    if (questions.length > 0) {
      setQuestion(questions[currentQuestionIndex].question);
    } else {
      console.error('No questions found in the JSON file');
    }
  }, [currentQuestionIndex]);

  // Function to handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Function to handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
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

      // Create an analyser node for waveform visualization
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

      // Start Speech Recognition if supported
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
    setWaveformVisible(false); // Hide waveform when recording stops
    setTextAreaVisible(false); // Hide text area when recording stops

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

        // Send the audio file to the backend
        sendAudioToBackend(audioBlob);
      } else {
        console.error('No audio data available to send');
      }
    };
  };

  const sendAudioToBackend = async (audioBlob) => {
    // Convert the audioBlob to Base64
    const base64Audio = await convertBlobToBase64(audioBlob);

    console.log("Sending audio to backend...");

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/audio/upload-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Send JSON content type
        },
        body: JSON.stringify({ audio: base64Audio }), // Send audio as JSON
        credentials: 'include', // Include cookies if necessary
      });

      if (!response.ok) {
        console.error('Failed to send audio to backend', response.statusText);
        return;
      }

      const responseData = await response.json();
      console.log('Backend Response:', responseData);
      setBackendResponse(responseData);
    } catch (error) {
      console.error('Error sending audio to backend:', error);
    }
  };

  // Function to convert Blob to Base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get Base64 part of the result
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

      canvasContext.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      canvasContext.fillStyle = '#1a1a1a'; // Dark background
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = '#4caf50'; // Bright green waveform
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
    setTestStarted(true); // Toggle test started state
    setTextAreaVisible(true); // Show the text area
  };

  const handleEndTestClick = () => {
    setTestStarted(false); // End the test
    setTextAreaVisible(false); // Hide the text area
  };

  return (
    <div className="record-container">
      {waveformVisible && <canvas id="waveform" width="600" height="200"></canvas>}

      {/* Start Test Button */}
      {!testStarted && (
        <div className="round-button-container">
          <button onClick={handleStartTestClick} className="round-btn">Start Test</button>
        </div>
      )}

      {/* End Test Button */}
      {testStarted && (
        <div className="round-button-container">
          <button onClick={handleEndTestClick} className="round-btn">End Test</button>
        </div>
      )}

      {/* Text Area */}
      {textAreaVisible && (
        <div className="text-area-wrapper">
          <button className="arrow-btn left" onClick={handlePreviousQuestion}>{'<'}</button>
          <textarea
            className="text-area"
            readOnly
            value={question}
          ></textarea>
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

      {/* Backend Response */}
      {backendResponse?.message === "Audio processed successfully." && (
  <div className="response-container">
    <h2>Backend Response</h2>
    <strong>Summary:</strong>
    <ul>
      {backendResponse.flaskResponse.summary.split("\n").map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
}

export default Record;
