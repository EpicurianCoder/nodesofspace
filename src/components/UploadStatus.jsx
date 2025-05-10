export default function UploadStatus({ status }) {
    return (
      <div className={`upload-status ${status.includes('Error') ? 'error' : status === 'unknown' || status === 'Uploading...' ? 'unknown' : 'success'} ${status ? 'visible' : ''}`}>
        {status === 'unknown' ? 'Awaiting processing...' : status || 'No status yet.'}
      </div>
    );
  }