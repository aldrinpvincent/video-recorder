import React from "react";
import { formatTime } from "../utils/time";
const MAX_RECORDING_TIME = 45 * 60; // 45 minutes in seconds

export type RecorderProps = {
  previewRef: React.RefObject<HTMLVideoElement>;
  recording: boolean;
  recordingTime: number;
  stopRecording: () => void;
  paused: boolean;
  startRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
};

export default function Recorder(props: RecorderProps) {
  const {
    previewRef,
    recording,
    recordingTime,
    stopRecording,
    paused,
    startRecording,
    pauseRecording,
    resumeRecording,
  } = props;
  return (
    <>
      <div className="video-preview-container">
        <video ref={previewRef} autoPlay className="video-preview" />
      </div>
      <div className="controls">
        <div className="timing">
          <span className="time-elapsed">{formatTime(recordingTime)}</span>/
          <span className="time-total">{formatTime(MAX_RECORDING_TIME)}</span>
        </div>
        {recording ? (
          <>
            {/* <div>
              Recording time: {formatTime(recordingTime)} /{" "}
              {formatTime(MAX_RECORDING_TIME)}
            </div> */}
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
          <>
            <button onClick={startRecording} className="start-button">
              Start Recording
            </button>
          </>
        )}
      </div>
    </>
  );
}
