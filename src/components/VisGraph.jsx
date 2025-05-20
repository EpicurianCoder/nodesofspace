'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataSet, Network } from 'vis-network/standalone/umd/vis-network.min';
import 'vis-network/styles/vis-network.css';
import { FiPlus } from 'react-icons/fi';
import { DiGoogleCloudPlatform } from "react-icons/di";
import Swal from 'sweetalert2';
import { renderToStaticMarkup } from 'react-dom/server';
import supabase from "@/lib/supabaseClient";
import tags from "@/lib/tags.json";

const VisGraph = ({ userId, items, email }) => {
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

      if (!items) {
        console.log("No items passed to /graph");
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
        description: item.description || 'No Description',
        bulk_data: item.bulk_data || null,
        svg_url: item.svg_url || 'No Image'
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
      console.log("nodesArray: ", nodesArray);

      const referenceJson = tags; // assuming tags.FunctionalUse is an object with keys
      const edgesArray = [];
      for (let i = 0; i < nodesArray.length; i++) {
        const node_a = nodesArray[i];
        for (let j = i + 1; j < nodesArray.length; j++) {
          const node_b = nodesArray[j];

          Object.keys(referenceJson.FunctionalUse).forEach((key) => {
            const aVal = node_a.bulk_data?.FunctionalUse[key];
            const bVal = node_b.bulk_data?.FunctionalUse[key];
            // console.log("Comparing ", aVal, " and ", bVal);

            // Only if both nodes share a non-null, matching value
            if (aVal != null && bVal != null && aVal === bVal) {
              edgesArray.push({ from: node_a.id, to: node_b.id });

              // Optionally assign group — only once, and don't overwrite it blindly
              if (!node_a.group) node_a.group = aVal;
              if (!node_b.group) node_b.group = bVal;
            }
          });
        }
      }

      // Dynamically create groupStyles for each FunctionalUse key
      const groupStyles = {};
      Object.keys(referenceJson.FunctionalUse).forEach((key, idx) => {
        // Generate a color for each group (simple hash for demo)
        const colors = [
          '#FFD700', '#87CEEB', '#90EE90', '#FFB6C1', '#FFA07A', '#B0C4DE', '#DDA0DD', '#98FB98', '#F08080', '#E6E6FA',
          '#B8860B', '#4682B4', '#228B22', '#8B008B', '#FF6347', '#20B2AA', '#FF69B4', '#CD5C5C', '#7B68EE', '#00CED1'
        ];
        groupStyles[key] = {
          color: { background: colors[idx % colors.length], border: '#333' },
          shape: 'dot'
        };
      });

      const nodes = new DataSet(nodesArray);
      const edges = new DataSet(edgesArray);

      const data = { nodes, edges };
      const options = {
        groups: groupStyles,
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
        edges: { arrows: { to: false }, smooth: true },
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based', // repulsion, barnesHut, hierarchicalRepulsion
          forceAtlas2Based: {
            gravitationalConstant: -1200, // Strength of repulsion between nodes
            avoidOverlap: 0,
            centralGravity: 0.15, // How much nodes are attracted to the center
            springLength: 250, // Ideal length for edges
            springConstant: 0.3, // How strongly edges pull nodes
            damping: 0.4, // Damping factor for velocity
          },
          minVelocity: 0.75, // Minimum velocity for node movement
        },
      };

      const network = new Network(containerRef.current, data, options);
      networkRef.current = network;
      // To cluster all nodes with the same group:
      Object.keys(groupStyles).forEach(groupName => {
        network.cluster({
          joinCondition: function(nodeOptions) {
            return nodeOptions.group === groupName;
          },
          clusterNodeProperties: {
            id: 'cluster:' + groupName,
            label: groupName + ' Cluster',
            borderWidth: 3,
            color: groupStyles[groupName].color,
            shape: groupStyles[groupName].shape,
          }
        });
      });

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
      <div className="logged-in">
        <p>Logged in as: {email}</p>
      </div>
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
