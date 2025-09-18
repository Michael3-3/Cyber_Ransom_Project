import React from 'react';
import './FileTable.css';

function FileTable({ files }) {
  return (
    <table className="file-table">
      <thead>
        <tr>
          <th>File Name</th>
          <th>Size (bytes)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file, idx) => (
          <tr key={idx}>
            <td>{file.path}</td>
            <td>{file.size}</td>
            <td>
              <span className={`status ${file.encrypted ? 'encrypted' : 'safe'}`}>
                {file.encrypted ? 'Encrypted' : 'Safe'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default FileTable;
