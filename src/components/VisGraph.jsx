'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataSet, Network } from 'vis-network/standalone/umd/vis-network.min';
import { createClient } from '@supabase/supabase-js';
import 'vis-network/styles/vis-network.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const VisGraph = () => {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAndRenderGraph = async () => {
      const { data: items, error } = await supabase
        .from('Items')
        .select('id, name');

      if (error) {
        console.error('Error fetching nodes:', error);
        return;
      }

      // Format nodes for vis-network
      const nodesArray = items.map((item) => ({
        id: item.id,
        label: item.name || `Item ${item.id}`,
      }));

      // Create random edges
      const edgesArray = [];
      for (let i = 0; i < nodesArray.length; i++) {
        const sourceId = nodesArray[i].id;
        const otherIds = nodesArray
          .map((n) => n.id)
          .filter((id) => id !== sourceId);

        const numEdges = Math.floor(Math.random() * 3) + 1;
        const targets = otherIds
          .sort(() => 0.5 - Math.random())
          .slice(0, numEdges);

        targets.forEach((targetId) => {
          edgesArray.push({ from: sourceId, to: targetId });
        });
      }

      const nodes = new DataSet(nodesArray);
      const edges = new DataSet(edgesArray);

      const data = { nodes, edges };
      const options = {
        nodes: { shape: 'dot', size: 20 },
        edges: { arrows: { to: true }, smooth: true },
        physics: { enabled: true },
      };

      const network = new Network(containerRef.current, data, options);

      network.on('click', (event) => {
        const { nodes: clickedNodes } = event;
        if (clickedNodes.length > 0) {
          const nodeId = clickedNodes[0];
          const nodeData = nodes.get(nodeId);
          setSelectedNode(nodeData);
        }
      });

      return () => network.destroy();
    };

    fetchAndRenderGraph();
  }, []);

  const handleEditClick = () => {
    if (selectedNode) {
      router.push(`/edit?id=${selectedNode.id}`);
    }
  };

  const handleUploadClick = () => {
    router.push('/upload'); // Navigate to the upload image page
  };

  return (
    <div>
      <div ref={containerRef} style={{ height: '600px' }} />
      {selectedNode && (
        <div style={{ marginTop: '20px' }}>
          <h3>Node Details</h3>
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Label:</strong> {selectedNode.label}</p>
          <button onClick={handleEditClick}>Edit</button>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleUploadClick}>Add Node</button>
      </div>
    </div>
  );
};

export default VisGraph;
