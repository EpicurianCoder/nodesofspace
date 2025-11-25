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

// The VisGraph component is the external library that renders an interacive node graph
// within the HTML window.

const VisGraph = ({ userId, items, email, fUseEdges, solver }) => {
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [nodesArray, setNodesArray] = useState([]);
  const [clusterIds, setClusterIds] = useState([]);
  const [dropdownValue, setDropdownValue] = useState('');
  const [nodeArrayGlobal, setNodeArrayGlobal] = useState([]);
  const [edgeArrayGlobal, setEdgeArrayGlobal] = useState([]);
  const networkRef = useRef(null);
  const [clustersOpen, setClustersOpen] = useState(true);
  const [printit, setPrintit] = useState(false);
  const groupStylesRef = useRef({});
  const optionsRef = useRef({});
  const [FUIDs, setFUIDs] = useState([]);
  // const [activityMatchCount, setActivityMatchCount] = useState(0);

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

      // Assign group by FunctionalUse key name
      nodesArray.forEach(node => {
        if (node.bulk_data && node.bulk_data.FunctionalUse) {
          for (const key of Object.keys(referenceJson.FunctionalUse)) {
            const val = node.bulk_data.FunctionalUse[key];
            if (val != null) {
              node.group = key; // assign the key name as the group
              break; // stop at the first match
            }
          }
        }
      });

      const countSharedTags = (itemA, itemB, referenceStructure) => {
        let matchCount = 0;

        const compareValues = (valA, valB) => {
          if (Array.isArray(valA) && Array.isArray(valB)) {
            return valA.filter(value => valB.includes(value)).length;
          } else if (typeof valA === 'string' && typeof valB === 'string') {
            return valA === valB ? 1 : 0;
          }
          return 0;
        };

        const recurseCompare = (obj, keyPath = []) => {
          for (const key in obj) {
            const currentPath = [...keyPath, key];

            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              recurseCompare(obj[key], currentPath);
            } else {
              // Access values from both items using key path
              const valueA = getNestedValue(itemA, currentPath);
              const valueB = getNestedValue(itemB, currentPath);
              const res = compareValues(valueA, valueB);
              matchCount += res;
              if (res > 0) {
                // console.log("Match: ", valueA, " and ", valueB);
              }
            }
          }
        };

        const getNestedValue = (obj, path) => {
          return path.reduce((acc, key) => acc?.[key], obj);
        };

        recurseCompare(referenceStructure);
        return matchCount;
      }

      const edgesArray = [];
     for (let i = 0; i < nodesArray.length; i++) {
        const node_a = nodesArray[i];

        for (let j = i + 1; j < nodesArray.length; j++) {
          const node_b = nodesArray[j];

          const matchCount = countSharedTags(node_a.bulk_data, node_b.bulk_data, tags);
          // console.log("Number of matching tags:", matchCount);
          if (matchCount > 5) {
            edgesArray.push({ 
              from: node_a.id, 
              to: node_b.id, 
              value: matchCount/2, 
              label: `${matchCount} shared properties`,
              dashes: true,
              color: "gray",
              scaling: {
                min: 1,
                max: 6
              }
            });
            // console.log(`Edge created from ${node_a.id} to ${node_b.id}`);
            // console.log(`Because the number of matching tags is ${matchCount}`);
          }

          const stringIfArray = (val) => {
            if (Array.isArray(val)) {
              return String(val[0]);
            } else if (typeof val === 'string') {
              return val;
            }
            else {
              return "";
            }
          };

          // Create solid edge based on a 'FunctionalUse' match
          if (fUseEdges) {
            const nodeAgroup = Object.keys(node_a.bulk_data.FunctionalUse)[0];
            const nodeBgroup = Object.keys(node_b.bulk_data.FunctionalUse)[0];
            // console.log("node_a functionalUseGroup: ", nodeAgroup);
            // console.log("node_b functionalUseGroup: ", nodeBgroup);
            const groupGroupValueA = stringIfArray(node_a.bulk_data.FunctionalUse[nodeAgroup]);
            const groupGroupValueB = stringIfArray(node_b.bulk_data.FunctionalUse[nodeBgroup]);
            // console.log("node_a functionalUseGroup Value: ", groupGroupValueA, "nodeID: ", node_a.id);
            // console.log("node_b functionalUseGroup Value: ", groupGroupValueB, "nodeID: ", node_b.id);
            if (groupGroupValueA === groupGroupValueB) {
                edgesArray.push({ 
                  from: node_a.id, 
                  to: node_b.id, 
                  color: "green", 
                  group: 'fu-edges',
                  value: 4, 
                  label: `${groupGroupValueA}` 
                });
                console.log(`Edge created from ${node_a.id} to ${node_b.id}`);
                console.log(`Because ${groupGroupValueA} = ${groupGroupValueB}`);
              }
          }
          
          // Makes solid edge based on shared 'AssociatedActivity' in 'SemanticTags'
          // const associatedActivities = tags.SemanticTags.AssociatedActivity;
          const aHasRaw = node_a.bulk_data?.SemanticTags.AssociatedActivity;
          const bHasRaw = node_b.bulk_data?.SemanticTags.AssociatedActivity;

          const listA = Array.isArray(aHasRaw) ? aHasRaw : [aHasRaw].filter(Boolean);
          const listB = Array.isArray(bHasRaw) ? bHasRaw : [bHasRaw].filter(Boolean);
          const [biggerList, smallerList] =
            listA.length > listB.length ? [listA, listB] : [listB, listA];

          const normalize = s => String(s).trim().toLowerCase();
          let activityCount = 0;

          for (const itemA of smallerList) {
            for (const itemB of biggerList) {
              if (normalize(itemA) === normalize(itemB)) {
                // console.log("Match");
                activityCount ++;
              }
            }
          }
          if (activityCount > 1) {
            edgesArray.push({ 
                from: node_a.id, 
                to: node_b.id, 
                color: "blue", 
                value: 4, 
                label: `${activityCount} associatedActivities` 
              });
              // console.log(`Edge created from ${node_a.id} to ${node_b.id}`);
              // console.log(`Because sharedCount = ${activityCount}`);
          }
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
      groupStylesRef.current = groupStyles;
      
      console.log("EdgeArray: ", edgesArray);

      setNodeArrayGlobal(nodesArray);
      setEdgeArrayGlobal(edgesArray);
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
            solver: "forceAtlas2Based", // forceAtlas2Based, repulsion, barnesHut, hierarchicalRepulsion
            forceAtlas2Based: {
              gravitationalConstant: -1000, // Strength of repulsion between nodes
              centralGravity: 0.055, // How much nodes are attracted to the center
              springLength: 210, // Ideal length for edges
              springConstant: 0.025, // How strongly edges pull nodes
              damping: 0.4, // Damping factor for velocity
            },
            minVelocity: 0.75, // Minimum velocity for node movement
          }
      };
      optionsRef.current = options;

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

  const changeSolver = () => {
    const nodes = new DataSet(nodeArrayGlobal);
    const edges = new DataSet(edgeArrayGlobal);
    const data = { nodes, edges };
    const options = optionsRef.current;
    console.log("Before any change: ", options);
    console.log(options.physics.solver);
    if (options.physics.solver === "barnesHut") {
      networkRef.current.setOptions({
        physics: {
          solver: 'forceAtlas2Based'
        }
      });
    }
    if (options.physics.solver === "forceAtlas2Based") {
      networkRef.current.setOptions({
        physics: {
          solver: 'barnesHut'
        }
      });
    }
    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;
  };

  const toggleClusters = () => {
    if (!networkRef.current) return;
    if (clustersOpen) {
      // Cluster all
      Object.keys(groupStylesRef.current).forEach(groupName => {
        networkRef.current.cluster({
          joinCondition: function(nodeOptions) {
            return nodeOptions.group === groupName;
          },
          clusterNodeProperties: {
            id: `Cluster ${groupName}`,
            label: groupName + ' Cluster',
            borderWidth: 3,
            color: groupStylesRef.current[groupName].color,
            shape: groupStylesRef.current[groupName].shape,
          }
        });
        // Update state with the new clusterId (only if it's not already in the list)
        setClusterIds((prev) =>
          prev.includes(`Cluster ${groupName}`) ? prev : [...prev, `Cluster ${groupName}`]
        );
      });
    } else {
      // Open all clusters
      clusterIds.forEach((id) => {
        try {
          networkRef.current.openCluster(id);
        } catch (err) {
          console.warn(`Could not open cluster ${id}:`, err.message);
        }
      });
    }
    setClustersOpen(!clustersOpen);
  };

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
    const { id, label, description, svg_url } = selectedNode;
    const nodeDescription = `
      Name: ${label}<br><br>
      ID: ${id}<br><br>
      Description: ${description}<br><br>
      SVG URL: ${svg_url}<br><br>
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
          <p><strong>Name:</strong> {selectedNode.label}</p><br/>
          <p><strong>Group:</strong> {selectedNode.group}</p><br/>
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
      <div style={{position: "fixed", bottom: 60, left: 20, margin: 20}}>
        <button className="cluster-toggle" onClick={toggleClusters}>
          {clustersOpen ? 'Collapse All Clusters' : 'Expand All Clusters'}
        </button>
      </div>
      {fUseEdges ? (
        <div style={{position: "fixed", bottom: 90, left: 20, margin: 20}}>
          <button className="edge-button">
            <a href="/graph">
              Render without FunctionalUse Edges
            </a>
          </button>
        </div>
      ) : (
        <div style={{position: "fixed", bottom: 90, left: 20, margin: 20}}>
          <button className="edge-button">
            <a href="/graph?fUseEdges=true">
              Render with FunctionalUse Edges
            </a>
          </button>
        </div>
      )}
      <div>
        <button className="solver1" onClick={changeSolver}>change solver</button>
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
