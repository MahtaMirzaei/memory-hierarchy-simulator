import React from 'react';

const PerformanceAnalysis = ({ performance }) => {
  const { hitRate, missRate, amat } = performance;

  return (
    <div className="performance-analysis">
      <h2>Performance Analysis</h2>
      <p>Hit Rate: {hitRate.toFixed(2)}%</p>
      <p>Miss Rate: {missRate.toFixed(2)}%</p>
      <p>Average Memory Access Time (AMAT): {amat.toFixed(2)} ns</p>
    </div>
  );
};

export default PerformanceAnalysis;
