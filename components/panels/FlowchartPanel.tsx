'use client';

import { useEffect, useRef } from 'react';
import { FlowchartNode, FlowchartEdge } from '@/types';
import mermaid from 'mermaid';

interface FlowchartPanelProps {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export function FlowchartPanel({ nodes, edges }: FlowchartPanelProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#9333ea',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7c3aed',
        lineColor: '#a78bfa',
        secondaryColor: '#3b82f6',
        tertiaryColor: '#1e293b',
        background: '#0f172a',
        mainBkg: '#1e293b',
        secondBkg: '#334155',
        textColor: '#fff',
        fontSize: '14px',
      },
    });
  }, []);

  useEffect(() => {
    if (nodes.length === 0 || !mermaidRef.current) return;

    // Generate Mermaid syntax
    let mermaidSyntax = 'graph TD\n';
    
    // Add nodes
    nodes.forEach((node) => {
      const nodeId = node.id.replace(/[^a-zA-Z0-9]/g, '_');
      const label = node.label.replace(/"/g, '\\"');
      
      switch (node.type) {
        case 'start':
          mermaidSyntax += `  ${nodeId}([${label}])\n`;
          break;
        case 'end':
          mermaidSyntax += `  ${nodeId}([${label}])\n`;
          break;
        case 'decision':
          mermaidSyntax += `  ${nodeId}{${label}}\n`;
          break;
        case 'process':
        default:
          mermaidSyntax += `  ${nodeId}[${label}]\n`;
          break;
      }
    });
    
    // Add edges
    edges.forEach((edge) => {
      const fromId = edge.from.replace(/[^a-zA-Z0-9]/g, '_');
      const toId = edge.to.replace(/[^a-zA-Z0-9]/g, '_');
      const label = edge.label ? `|${edge.label}|` : '';
      mermaidSyntax += `  ${fromId} -->${label} ${toId}\n`;
    });

    // Apply styles
    mermaidSyntax += '\n  classDef default fill:#334155,stroke:#7c3aed,stroke-width:2px,color:#fff\n';
    mermaidSyntax += '  classDef decision fill:#9333ea,stroke:#a78bfa,stroke-width:2px,color:#fff\n';
    
    // Render
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-flowchart', mermaidSyntax);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="text-white/60 text-sm p-4">플로우차트를 생성하는 중 오류가 발생했습니다.</div>`;
        }
      }
    };

    renderChart();
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="mb-2">플로우차트가 생성되지 않았습니다.</p>
          <p className="text-sm">대화를 진행하면 자동으로 생성됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">의사결정 플로우</h2>
        <div 
          ref={mermaidRef} 
          className="bg-white rounded-2xl p-6 overflow-auto border border-gray-200 shadow-sm"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
}


