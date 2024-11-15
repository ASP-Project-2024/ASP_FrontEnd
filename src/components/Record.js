import React, { useState, useRef, useEffect } from 'react';
import './Record.css';

function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
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

        let finalTranscript = ''; // Store final results

        recognition.onresult = (event) => {
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              finalTranscript += transcript; // Append final results
            } else {
              interimTranscript += transcript; // Collect interim results
            }
          }

          // Update the state with combined final and interim transcriptions
          setTranscribedText(finalTranscript + interimTranscript);
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

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);

    if (recognition) {
      recognition.stop();
    }

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      audioChunks.current = [];

      // Send the transcription to the backend
      if (transcribedText.trim()) {
        sendTextToBackend(transcribedText.trim());
      } else {
        console.warn('No transcription available.');
      }
    };
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

  const sendTextToBackend = async (text) => {
    console.log('Sending to backend:', text);
    try {
      const response = await fetch('http://localhost:2000/audio/upload-txt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraph: text }),
      });

      if (!response.ok) {
        console.error('Failed to send text to backend');
        return;
      }

      const responseData = await response.json();
      console.log('Backend Response:', responseData);
    } catch (error) {
      console.error('Error sending text to backend:', error);
    }
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
