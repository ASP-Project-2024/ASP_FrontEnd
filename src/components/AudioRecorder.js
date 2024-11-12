import React, { useState, useEffect, useRef } from 'react';

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    // Set up the media recorder on component mount
    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        
        // Collect audio chunks when data is available
        recorder.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        // Set media recorder instance
        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error accessing the microphone", error);
      }
    };
    initMediaRecorder();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      setIsRecording(true);
      audioChunks.current = [];  // Reset audio chunks for a new recording
      mediaRecorder.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      setIsRecording(false);
      mediaRecorder.stop();

      // Convert audio chunks to a blob and create an audio URL
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        // Optionally, you could download the audio file or send it to a server
        downloadAudio(audioBlob);
      };
    }
  };

  const downloadAudio = (audioBlob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(audioBlob);
    link.download = 'recording.mp3';
    link.click();
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioURL && (
        <audio controls src={audioURL} />
      )}
    </div>
  );
}

export default AudioRecorder;
