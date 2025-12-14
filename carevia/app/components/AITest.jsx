import React, { useState } from 'react';

export default function AITest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult('Testing...');

    const formData = new FormData();
    formData.append('image', file); // ⚠️ Keep as 'image', API converts it to 'media'

    try {
      const res = await fetch('/api/test-sightengine', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Sightengine</h1>
      
      <input
        type="file"
        accept="image/*"
        onChange={testUpload}
        className="mb-4 block"
        disabled={loading}
      />
      
      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
          {result}
        </pre>
      )}
    </div>
  );
}
