'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataSet, Network } from 'vis-network/standalone/umd/vis-network.min';
import 'vis-network/styles/vis-network.css';
import { FiPlus } from 'react-icons/fi';
import { DiGoogleCloudPlatform } from "react-icons/di";
import Swal from 'sweetalert2';
import { renderToStaticMarkup } from 'react-dom/server';
import supabase from '@/lib/supabaseClient';

const VisGraph = () => {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [nodesArray, setNodesArray] = useState([]);
  const [dropdownValue, setDropdownValue] = useState('');
  const networkRef = useRef(null);

  useEffect(() => {
    const fetchAndRenderGraph = async () => {
      setLoading(true);

      const { data: items, error } = await supabase
        .from('Items')
        .select('id, name, description, location, categories, svg_url');

      if (error) {
        console.error('Error fetching nodes:', error);
        return;
      }

      const convertIconToBase64 = (IconComponent) => {
        const svgMarkup = renderToStaticMarkup(<IconComponent />);
        const base64Svg = btoa(svgMarkup);
        return `data:image/svg+xml;base64,${base64Svg}`;
      };

      const base64IconPlus = convertIconToBase64(DiGoogleCloudPlatform);

      const nodesArray = items.map((item) => ({
        id: item.id,
        label: item.name || `Item ${item.id}`,
        description: item.description || '',
        location: item.location || '',
        categories: item.categories || '',
        svg_url: item.svg_url || '',
        image: base64IconPlus
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

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
        interaction: {
          multiselect: true,
          dragNodes: true,
          zoomView: true
        },
        nodes: { 
          shape: 'dot', 
          size: 20, 
          font: {
            color: '#111827',
            size: 25,
            face: 'Arial'
            }
          },
        edges: { arrows: { to: true }, smooth: true },
        physics: {
          enabled: true,
          solver: 'barnesHut',
          barnesHut: {
            gravitationalConstant: -20000, // Strength of repulsion between nodes
            centralGravity: 0.3, // How much nodes are attracted to the center
            springLength: 200, // Ideal length for edges
            springConstant: 0.02, // How strongly edges pull nodes
            damping: 0.09, // Damping factor for velocity
          },
          minVelocity: 0.75, // Minimum velocity for node movement
        },
      };

      const network = new Network(containerRef.current, data, options);
      networkRef.current = network;

      network.on('click', (event) => {
        const { nodes: clickedNodes } = event;
        if (clickedNodes.length == 0) {
          setSelectedNode(null);
        }
      });

      network.on('select', function(event) {
        const { nodes: clickedNodes } = event;
        if (clickedNodes.length == 1) {
          const nodeId = clickedNodes[0];
          const nodeData = nodes.get(nodeId);
          setSelectedNode(nodeData);
        }
        if (clickedNodes.length > 1) {
          setSelectedNode(null);
        }
        console.log('Selected nodes:', event.nodes);
      });

      network.on('deselect', function(event) {
        setSelectedNode(null);
        setSelectedValue("");
        console.log('Deselected nodes:', event.nodes);
      });

      setNodesArray(nodesArray);
      setLoading(false);
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
    router.push('/upload');
  };

  const handleDelete = () => {
    Swal.fire({
      title: 'Please Confirm',
      text: 'Are you sure you want to permanently remove this node?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Reject',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/delete?id=${selectedNode.id}`, {
            method: 'DELETE',
          });
  
          if (response.ok) {
            Swal.fire('Deleted!', 'The node has been deleted.', 'success').then(() => {
              window.location.reload();
            });
          } else {
            const errorData = await response.json();
            Swal.fire('Error!', errorData.message || 'Failed to delete the node.', 'error');
          }
        } catch (error) {
          console.error('Error deleting node:', error);
          Swal.fire('Error!', 'An unexpected error occurred.', 'error');
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Rejected!', 'You have rejected the action.', 'error');
      }
    });
  };

  const handleFullDetails = async () => {
    const { id, description, location, categories, svg_url } = selectedNode;
    const nodeDescription = `
      Description: ${description}<br><br>
      Location: ${location}<br><br>
      SVG URL: ${svg_url}<br><br>
      Categories: ${categories}<br>
    `;
    const { data, error } = await supabase.storage
      .from('nothings')
      .createSignedUrl(svg_url, 3600)
    if (data) {
      console.log(data.signedUrl)
    }
    if (error) {
      console.error('Error fetching signed URL:', error);
      return;
    }
    Swal.fire({
              title: 'Full Node Details',
              html: nodeDescription,
              imageUrl: data.signedUrl,
              customClass: {
                image: 'swal-custom-image'
              },
              imageAlt: 'Reference Image',
              icon: 'info',
              confirmButtonText: 'OK'
            });
  };

  return (
    <div>
      {loading && (
        <div className="loading-overlay">
        <div className="spinner"></div>
        <p>LOADING...</p>
        </div>
        )}
      <div ref={containerRef} style={{ height: '600px' }} />
      {selectedNode !== null && (
        <div className="floating-node-details">
          <h3>Node Details</h3><br/>
          <p><strong>ID:</strong> {selectedNode.id}</p><br/>
          <p><strong>Label:</strong> {selectedNode.label}</p><br/>
          <button onClick={handleFullDetails}>View Full Details</button>
          <button onClick={handleEditClick}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <button className="floating-add-button" onClick={handleUploadClick}>
          <FiPlus className="add-icon" /> Add Node
        </button>
      </div>
      <div className ="select-node">
        <select
          value={dropdownValue}
          className="node-select"
          onChange={(e) => {
            const nodeId = e.target.value;
            if (nodeId) {
              const node = nodesArray.find((n) => n.id === parseInt(nodeId));
              if (node) {
                setSelectedNode(node);
                // Highlight the node
                if (networkRef.current) {
                  networkRef.current.selectNodes([node.id]); // Highlight the node
                  networkRef.current.focus(node.id, {
                    scale: 0.8, // Zoom
                    animation: { duration: 500 },
                  });
                }
              }
              setDropdownValue('');
            }
          }}
        >
          <option value="" disabled>
            Find a node...
          </option>
          {nodesArray.map((node) => (
            <option key={node.id} value={node.id}>
              {node.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VisGraph;
