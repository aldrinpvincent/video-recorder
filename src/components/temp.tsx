import React, { useState, useRef, useEffect, useCallback } from "react";
import "./VideoRecorder.css";

const VideoRecorder: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [maxRecordingTime] = useState<number>(30); // 30 seconds time limit
  const [permissionError, setPermissionError] = useState(false);

  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const init = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = handleDataAvailable;
      }
    } catch (error) {
      // permission denied check
      if (error.name === "NotAllowedError") {
        setPermissionError(true);
      }
    }
  }, []);

  useEffect(() => {
    init();

    return () => {
      if (mediaRecorderRef.current && previewRef.current?.srcObject) {
        mediaRecorderRef.current.stop();
        previewRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        setRecording(false);
        clearInterval(recordingIntervalRef.current!);
        setRecordingTime(0);
      }
    };
  }, [init]);

  if (permissionError) {
    return (
      <div className="permission-error">
        Permission denied, please allow access to camera and microphone
      </div>
    );
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = handleDataAvailable;
        recorder.start();
        setRecording(true);
        mediaRecorderRef.current = recorder;
        startRecordingTimer();
      }
    } catch (error) {
      console.error("Error starting recording: ", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && previewRef.current?.srcObject) {
      mediaRecorderRef.current.stop();
      previewRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setRecording(false);
      clearInterval(recordingIntervalRef.current!);
      setRecordingTime(0);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && !paused) {
      mediaRecorderRef.current.pause();
      setPaused(true);
      clearInterval(recordingIntervalRef.current!);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && paused) {
      mediaRecorderRef.current.resume();
      setPaused(false);
      startRecordingTimer();
    }
  };

  const startRecordingTimer = () => {
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const handleDataAvailable = (event: BlobEvent) => {
    const chunks: Blob[] = [];
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
    const blob = new Blob(chunks, { type: "video/webm" });
    setRecordedBlob(blob);
  };

  return (
    <div className="video-recorder">
      <div className="video-preview-container">
        <video ref={previewRef} autoPlay className="video-preview" />
      </div>
      <div className="controls">
        {recording ? (
          <>
            <div>Recording time: {recordingTime} seconds</div>
            <button onClick={stopRecording} className="stop-button">
              Stop Recording
            </button>
            {!paused ? (
              <button onClick={pauseRecording} className="pause-button">
                Pause
              </button>
            ) : (
              <button onClick={resumeRecording} className="resume-button">
                Resume
              </button>
            )}
          </>
        ) : (
          <button onClick={startRecording} className="start-button">
            Start Recording
          </button>
        )}
      </div>
      {recordedBlob && (
        <div className="recorded-video">
          <h2>Recording</h2>
          <video
            src={URL.createObjectURL(recordedBlob)}
            width="320"
            height="240"
            controls
          />
          <a
            href={URL.createObjectURL(recordedBlob)}
            download="RecordedVideo.webm"
            className="download-link"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
