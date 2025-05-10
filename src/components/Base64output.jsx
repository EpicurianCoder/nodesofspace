export default function Base64output({ base64Image }) {
    return (
        <div className={`base64-output ${base64Image ? 'visible' : ''}`}>
            <h3 className="base64-title">Base64 Representation</h3>
            <div className="base64-container">
                <textarea
                readOnly
                value={base64Image || ''}
                className="base64-textarea"
                />
            </div>
        </div>
    );
}