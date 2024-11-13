import React, { useState, useRef } from 'react';
import './Record.css';

function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(''); // State to store the audio URL for download
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true);

  // Check for browser support for the Web Speech API
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setIsSpeechRecognitionSupported(false);
  }

  const recognition = isSpeechRecognitionSupported ? new SpeechRecognition() : null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start Speech Recognition for real-time transcribing
      if (recognition) {
        recognition.lang = 'en-US';  // Set language for speech recognition
        recognition.continuous = true;  // Keep transcribing continuously
        recognition.interimResults = true;  // Allow interim results

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setTranscribedText(transcript); // This stores the transcribed text but will not display it
        };

        recognition.start();
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    // Stop Speech Recognition
    if (recognition) {
      recognition.stop();
    }

    mediaRecorderRef.current.onstop = () => {
      // Combine the audio chunks and create a downloadable URL for the audio file
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });  // Audio type can be 'audio/webm' or 'audio/mp4'
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl); // Store the audio URL to allow downloading
      audioChunks.current = []; // Reset audio chunks after recording
    };
  };

  const saveAudioFile = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'recorded-audio.webm'; // You can change the extension to .mp3 or .mp4 if you want
    link.click();
  };

  const saveToTextFile = () => {
    const textBlob = new Blob([transcribedText], { type: 'text/plain' });
    const textURL = URL.createObjectURL(textBlob);
    const link = document.createElement('a');
    link.href = textURL;
    link.download = 'transcription.txt';
    link.click();
  };

  return (
    <div className="record-container">
      <h1>Recording Page</h1>
      
      <button onClick={startRecording} disabled={isRecording || !isSpeechRecognitionSupported}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>

      <div>
        {audioUrl && (
          <button onClick={saveAudioFile}>Download Audio</button>
        )}
        {transcribedText && (
          <button onClick={saveToTextFile}>Save as Text File</button>
        )}
      </div>

      {!isSpeechRecognitionSupported && (
        <p>Speech recognition is not supported in your browser.</p>
      )}
    </div>
  );
}

export default Record;
