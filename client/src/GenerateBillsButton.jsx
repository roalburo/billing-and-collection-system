import React, { useState } from 'react';
import axios from 'axios';

function GenerateBillsButton() {
  const [loading, setLoading] = useState(false);

  const handleGenerateBills = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/generateBills');
      console.log(response.data);
      alert(`Bills generated: ${response.data.generatedBills.length}\nBills penalized: ${response.data.penalizedBills.length}`);
    } catch (err) {
      console.error('Error generating bills:', err);
      alert('Failed to generate bills.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGenerateBills} className="btn btn-primary" disabled={loading}>
      {loading ? 'Generating...' : 'Refresh'}
    </button>
  );
}

export default GenerateBillsButton;
