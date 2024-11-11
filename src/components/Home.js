import React, { useState, useRef } from 'react';
import './Home.css';

function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const speechRecognitionRef = useRef(null);

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

      // Start speech recognition for transcribing audio to text
      if (!speechRecognitionRef.current) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.lang = 'en-US';

        speechRecognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscribedText(transcript);  // Set transcribed text from speech recognition
        };

        speechRecognitionRef.current.start();
      }
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      setAudioBlob(audioBlob);  // Store the audio blob for download

      // Reset audioChunks after saving
      audioChunks.current = [];

      // Stop the speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  };

  const downloadAudio = () => {
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audio.webm';
    link.click();
  };

  const saveTextFile = () => {
    const textBlob = new Blob([transcribedText], { type: 'text/plain' });
    const textURL = URL.createObjectURL(textBlob);
    const link = document.createElement('a');
    link.href = textURL;
    link.download = 'transcription.txt';
    link.click();
  };

  return (
    <div className="home-container">
      <h1>Welcome to Home Page</h1>
      
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>

      <div>
        {/* Audio Download Link */}
        {audioBlob && (
          <button onClick={downloadAudio}>Download Audio</button>
        )}

        {/* Text File Download Link */}
        {transcribedText && (
          <button onClick={saveTextFile}>Save Text File</button>
        )}
      </div>
    </div>
  );
}

export default Home;
