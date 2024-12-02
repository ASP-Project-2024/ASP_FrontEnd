import React, { useState, useRef, useEffect } from 'react';
import './Record.css';

function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);
  const [waveformVisible, setWaveformVisible] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = isSpeechRecognitionSupported ? new SpeechRecognition() : null;

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSpeechRecognitionSupported(false);
    }
  }, [SpeechRecognition]);

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
    if (!waveformVisible) return;

    const canvas = document.getElementById('waveform');
    
    if (!canvas) {
      console.error("Canvas element not found!");
      return;
    }

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      console.error("Failed to get canvas context!");
      return;
    }

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

  return (
    <div className="record-container">
      <h1>Recording Page</h1>
      {waveformVisible && <canvas id="waveform" width="600" height="200"></canvas>}

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
