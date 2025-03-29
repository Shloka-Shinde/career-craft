import React, { useEffect, useRef, useState } from 'react';

const PathwayChart = ({ data }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !data.nodes.length) return;
    
    // Reset zoom and position when data changes
    setScale(1);
    setOffset({ x: 0, y: 0 });
    
    renderChart();
  }, [data]);

  useEffect(() => {
    renderChart();
  }, [scale, offset]);

  const renderChart = () => {
    if (!canvasRef.current || !data.nodes.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply scale and translation
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Map nodes by their ID for easy lookup
    const nodesMap = new Map();
    
    // Group nodes by level
    const levelGroups = {};
    data.nodes.forEach(node => {
      if (!levelGroups[node.level]) {
        levelGroups[node.level] = [];
      }
      levelGroups[node.level].push(node);
    });

    // Calculate max levels and level counts
    const maxLevel = Math.max(...data.nodes.map(node => node.level));
    
    // Calculate positions for each node
    const margin = 40;
    const levelHeight = (canvas.height / scale - margin * 2) / (maxLevel + 1);
    
    Object.entries(levelGroups).forEach(([level, nodes]) => {
      const levelNum = parseInt(level);
      const nodeCount = nodes.length;
      const levelWidth = canvas.width / scale - margin * 2;
      const nodeSpacing = levelWidth / (nodeCount + 1);
      
      nodes.forEach((node, index) => {
        // Calculate x position to distribute nodes evenly
        const x = margin + nodeSpacing * (index + 1);
        const y = margin + levelHeight * levelNum;
        
        nodesMap.set(node.id, { ...node, x, y });
      });
    });

    // Draw horizontal guidelines
    ctx.strokeStyle = '#e5e7eb';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= maxLevel; i++) {
      const y = margin + levelHeight * i - levelHeight / 2;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(canvas.width / scale - margin, y);
      ctx.stroke();
    }
    
    // Reset line dash for node connections
    ctx.setLineDash([]);

    // Draw connections between nodes
    data.nodes.forEach(node => {
      if (node.children && node.children.length) {
        const parent = nodesMap.get(node.id);
        if (!parent) return;
        
        node.children.forEach(childId => {
          const child = nodesMap.get(childId);
          if (!child) return;
          
          // Draw curved connector line
          ctx.strokeStyle = '#cbd5e1'; 
          ctx.lineWidth = 1.5;
          
          // Create curved path
          ctx.beginPath();
          ctx.moveTo(parent.x, parent.y + 25); // Bottom of parent
          
          // Control points for the curve
          const controlPoint1X = parent.x;
          const controlPoint1Y = parent.y + (child.y - parent.y) / 3;
          const controlPoint2X = child.x;
          const controlPoint2Y = parent.y + 2 * (child.y - parent.y) / 3;
          
          ctx.bezierCurveTo(
            controlPoint1X, controlPoint1Y,
            controlPoint2X, controlPoint2Y,
            child.x, child.y - 25
          );
          
          ctx.stroke();
          
          // Draw arrow at the end
          const angle = Math.atan2(child.y - 25 - controlPoint2Y, child.x - controlPoint2X);
          const arrowSize = 6;
          
          ctx.beginPath();
          ctx.moveTo(child.x, child.y - 25);
          ctx.lineTo(
            child.x - arrowSize * Math.cos(angle - Math.PI / 6),
            child.y - 25 - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            child.x - arrowSize * Math.cos(angle + Math.PI / 6),
            child.y - 25 - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = '#cbd5e1';
          ctx.fill();
        });
      }
    });

    // Draw nodes
    nodesMap.forEach(node => {
      // Get node dimensions based on the text
      ctx.font = 'bold 12px Inter, sans-serif';
      const textMetrics = ctx.measureText(node.label);
      const textWidth = textMetrics.width;
      
      const boxWidth = Math.min(Math.max(textWidth + 40, 140), 220);
      const boxHeight = 50;
      
      // Different colors based on level
      let fillColor = node.color;
      let strokeColor = '#e2e8f0';
      
      // Node shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      // Node box
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      
      // Draw rounded rectangle
      ctx.beginPath();
      const radius = 10;
      ctx.moveTo(node.x - boxWidth / 2 + radius, node.y - boxHeight / 2);
      ctx.lineTo(node.x + boxWidth / 2 - radius, node.y - boxHeight / 2);
      ctx.quadraticCurveTo(node.x + boxWidth / 2, node.y - boxHeight / 2, node.x + boxWidth / 2, node.y - boxHeight / 2 + radius);
      ctx.lineTo(node.x + boxWidth / 2, node.y + boxHeight / 2 - radius);
      ctx.quadraticCurveTo(node.x + boxWidth / 2, node.y + boxHeight / 2, node.x + boxWidth / 2 - radius, node.y + boxHeight / 2);
      ctx.lineTo(node.x - boxWidth / 2 + radius, node.y + boxHeight / 2);
      ctx.quadraticCurveTo(node.x - boxWidth / 2, node.y + boxHeight / 2, node.x - boxWidth / 2, node.y + boxHeight / 2 - radius);
      ctx.lineTo(node.x - boxWidth / 2, node.y - boxHeight / 2 + radius);
      ctx.quadraticCurveTo(node.x - boxWidth / 2, node.y - boxHeight / 2, node.x - boxWidth / 2 + radius, node.y - boxHeight / 2);
      ctx.closePath();
      
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();
      
      // Add level indicator dot
      const dotRadius = 3;
      ctx.beginPath();
      ctx.arc(node.x - boxWidth / 2 + 12, node.y - boxHeight / 2 + 12, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = node.level === 0 ? '#3b82f6' : 
                      node.level === 1 ? '#8b5cf6' : 
                      node.level === 2 ? '#10b981' : 
                      node.level === 3 ? '#f59e0b' : '#ec4899';
      ctx.fill();
      
      // Node text
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Word wrapping for long text
      const words = node.label.split(' ');
      let line = '';
      let lines = [];
      const lineHeight = 16;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > boxWidth - 30 && i > 0) {
          lines.push(line);
          line = words[i] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      // Draw each line of text
      lines.forEach((lineText, index) => {
        const lineY = node.y - ((lines.length - 1) * lineHeight / 2) + (index * lineHeight);
        ctx.fillText(lineText, node.x, lineY);
      });
    });
    
    ctx.restore();
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    const scaleChange = -delta * 0.001;
    const newScale = Math.max(0.5, Math.min(2, scale + scaleChange));
    setScale(newScale);
  };

  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartDragPos({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for panning
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - startDragPos.x;
    const dy = e.clientY - startDragPos.y;
    
    setOffset({
      x: offset.x + dx,
      y: offset.y + dy
    });
    
    setStartDragPos({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 right-0 z-10 flex gap-2 m-2">
        <button 
          onClick={() => setScale(Math.min(2, scale + 0.1))}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          +
        </button>
        <button 
          onClick={() => setScale(Math.max(0.5, scale - 0.1))}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          -
        </button>
        <button 
          onClick={() => {
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
        >
          R
        </button>
      </div>
      <canvas 
        ref={canvasRef} 
        className="w-full h-[700px] border border-gray-100 rounded-md bg-white cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default PathwayChart;