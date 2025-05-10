export default function ProcessAction({ handleUpload }) {
    return (
      <div className="process-action">
        <button onClick={handleUpload} className="upload-button">
          Process Image
        </button>
      </div>
    );
  }