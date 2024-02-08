import React, { useState, useRef, useEffect, useCallback } from "react";
import "./VideoRecorder.css";
import VideoPreview from "./VideoPreview";
import Recorder from "./Recorder";

const VideoRecorder: React.FC = () => {
  const [recording, setRecording] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [permissionError, setPermissionError] = useState(true);

  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);

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
      setPermissionError(false);
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
          .forEach((track: any) => track.stop());
        setRecording(false);
        clearInterval(recordingIntervalRef.current!);
        setRecordingTime(0);
      }
    };
  }, [init]);

  if (permissionError) {
    return (
      <div className="permission-error">
        Please allow access to camera and microphone
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
      {recordedBlob ? (
        <VideoPreview
          recordedBlob={recordedBlob}
          setRecordedBlob={setRecordedBlob}
          init={init}
        />
      ) : (
        <Recorder
          recording={recording}
          paused={paused}
          recordingTime={recordingTime}
          previewRef={previewRef}
          startRecording={startRecording}
          stopRecording={stopRecording}
          pauseRecording={pauseRecording}
          resumeRecording={resumeRecording}
        />
      )}
    </div>
  );
};

export default VideoRecorder;
