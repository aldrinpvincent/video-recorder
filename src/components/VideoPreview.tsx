export type VideoPreviewProps = {
  recordedBlob: Blob;
  setRecordedBlob: (blob: Blob | null) => void;
  init: () => void;
};

export default function VideoPreview(props: VideoPreviewProps) {
  const { recordedBlob, setRecordedBlob, init } = props;
  return (
    <div className="recorded-video">
      <video
        src={URL.createObjectURL(recordedBlob)}
        controls
        className="video-preview"
      />
      <div className="controls">
        <a
          href={URL.createObjectURL(recordedBlob)}
          download="RecordedVideo.webm"
          className="download-link"
          role="button"
        >
          Download
        </a>

        <button
          onClick={() => {
            setRecordedBlob(null);
            init();
          }}
          className="delete-button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
