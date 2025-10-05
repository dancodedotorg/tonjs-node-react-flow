import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Import songs data
import songsData from './songs.json';

// ToneJS is loaded globally via CDN in index.html
// Access it via window.Tone with proper checking

// Song Select Node Component
const SongSelectNode = ({ data, isConnectable }) => {
  const [selectedPack, setSelectedPack] = useState('');
  const [selectedSound, setSelectedSound] = useState('');
  const [availableSounds, setAvailableSounds] = useState([]);

  const handlePackChange = (e) => {
    const packIndex = e.target.value;
    setSelectedPack(packIndex);
    setSelectedSound('');
    
    if (packIndex !== '') {
      const pack = songsData.packs[packIndex];
      setAvailableSounds(pack.sounds);
      // Update the data for the connected output node
      data.onSelectionChange(null);
    } else {
      setAvailableSounds([]);
      data.onSelectionChange(null);
    }
  };

  const handleSoundChange = (e) => {
    const soundIndex = e.target.value;
    setSelectedSound(soundIndex);
    
    if (selectedPack !== '' && soundIndex !== '') {
      const pack = songsData.packs[selectedPack];
      const sound = pack.sounds[soundIndex];
      const audioUrl = buildAudioUrl(pack, sound);
      
      data.onSelectionChange({
        pack: pack,
        sound: sound,
        audioUrl: audioUrl
      });
    } else {
      data.onSelectionChange(null);
    }
  };

  const buildAudioUrl = (pack, sound) => {
    const basePath = songsData.path;
    return `https://curriculum.code.org/media/musiclab/${basePath}/${pack.path}/${sound.path}/${sound.src}.mp3`;
  };

  return (
    <div className="song-select-node">
      <div className="node-header">
        <h3>🎵 Song Select</h3>
      </div>
      
      <div className="node-content">
        <div className="selector-group">
          <label>Pack:</label>
          <select value={selectedPack} onChange={handlePackChange}>
            <option value="">-- Choose a pack --</option>
            {songsData.packs.map((pack, index) => (
              <option key={index} value={index}>
                {pack.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="selector-group">
          <label>Sound:</label>
          <select 
            value={selectedSound} 
            onChange={handleSoundChange}
            disabled={availableSounds.length === 0}
          >
            <option value="">-- Choose a sound --</option>
            {availableSounds.map((sound, index) => (
              <option key={index} value={index}>
                {sound.name} ({sound.type})
              </option>
            ))}
          </select>
        </div>
        
        {selectedPack !== '' && selectedSound !== '' && (
          <div className="current-selection">
            <p><strong>Pack:</strong> {songsData.packs[selectedPack].name}</p>
            <p><strong>Sound:</strong> {availableSounds[selectedSound].name}</p>
            <p><strong>Type:</strong> {availableSounds[selectedSound].type}</p>
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="handle-right"
      />
    </div>
  );
};

// High Pass Filter Node Component
const HighPassFilterNode = ({ data, isConnectable }) => {
  const [frequency, setFrequency] = useState(1000);

  const handleFrequencyChange = (e) => {
    const newFreq = parseInt(e.target.value);
    setFrequency(newFreq);
    
    // Update the filter data
    if (data.onFilterChange) {
      data.onFilterChange({
        type: 'highpass',
        frequency: newFreq
      });
    }
  };

  return (
    <div className="highpass-filter-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="handle-left"
      />
      
      <div className="node-header">
        <h3>🎛️ High Pass Filter</h3>
      </div>
      
      <div className="node-content">
        <div className="filter-control">
          <label>Frequency: {frequency} Hz</label>
          <input
            type="range"
            min="20"
            max="20000"
            value={frequency}
            onChange={handleFrequencyChange}
            className="frequency-slider"
          />
          <div className="frequency-labels">
            <span>20Hz</span>
            <span>20kHz</span>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="handle-right"
      />
    </div>
  );
};

// Pitch Shift Node Component
const PitchShiftNode = ({ data, isConnectable }) => {
  const [semitones, setSemitones] = useState(0);

  const handleSemitonesChange = (e) => {
    const newSemitones = parseInt(e.target.value);
    setSemitones(newSemitones);
    
    // Update the pitch shift data
    if (data.onFilterChange) {
      data.onFilterChange({
        type: 'pitchshift',
        semitones: newSemitones
      });
    }
  };

  return (
    <div className="pitchshift-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="handle-left"
      />
      
      <div className="node-header">
        <h3>🎵 Pitch Shift</h3>
      </div>
      
      <div className="node-content">
        <div className="filter-control">
          <label>Pitch: {semitones > 0 ? '+' : ''}{semitones} semitones</label>
          <input
            type="range"
            min="-10"
            max="10"
            value={semitones}
            onChange={handleSemitonesChange}
            className="semitones-slider"
          />
          <div className="frequency-labels">
            <span>-10</span>
            <span>0</span>
            <span>+10</span>
          </div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="handle-right"
      />
    </div>
  );
};

// Output Node Component
const OutputNode = ({ data, isConnectable }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentChain, setCurrentChain] = useState([]);
  const [status, setStatus] = useState('Disconnected');

  const isConnected = data.isConnected;
  const songData = data.songData;
  const effectChain = data.effectChain || [];

  const playAudio = async () => {
    if (!songData || !isConnected) return;

    try {
      // Check if Tone is available
      if (!window.Tone) {
        throw new Error('ToneJS not loaded');
      }

      const Tone = window.Tone;

      // Ensure audio context is started
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Stop any existing player and dispose of chain
      if (currentPlayer) {
        currentPlayer.stop();
        currentPlayer.dispose();
      }
      
      // Dispose of existing effect chain
      currentChain.forEach(effect => {
        if (effect && effect.dispose) {
          effect.dispose();
        }
      });

      // Create new player
      const player = new Tone.Player({
        url: songData.audioUrl,
        loop: true,
        autostart: false
      });

      // Create effect chain
      const effects = [];
      effectChain.forEach(effectData => {
        if (effectData.type === 'highpass') {
          const filter = new Tone.Filter(effectData.frequency, 'highpass');
          effects.push(filter);
        } else if (effectData.type === 'pitchshift') {
          const pitchShift = new Tone.PitchShift(effectData.semitones);
          effects.push(pitchShift);
        }
        // Add more effect types here as needed
      });

      // Connect the chain: player -> effects -> destination
      let currentNode = player;
      effects.forEach(effect => {
        currentNode.connect(effect);
        currentNode = effect;
      });
      currentNode.toDestination();

      // Store the chain for cleanup
      setCurrentChain(effects);

      // Wait for buffer to load
      await Tone.loaded();

      // Start playback
      player.start();
      setCurrentPlayer(player);
      setIsPlaying(true);
      
      const effectsText = effectChain.length > 0
        ? ` with ${effectChain.length} effect(s)`
        : '';
      setStatus(`Playing: ${songData.sound.name}${effectsText} (looping)`);

    } catch (error) {
      console.error('Error playing audio:', error);
      setStatus('Error playing audio');
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (currentPlayer) {
      currentPlayer.stop();
      currentPlayer.dispose();
      setCurrentPlayer(null);
    }
    
    // Dispose of effect chain
    currentChain.forEach(effect => {
      if (effect && effect.dispose) {
        effect.dispose();
      }
    });
    setCurrentChain([]);
    
    setIsPlaying(false);
    setStatus(isConnected ? 'Connected - Ready to play' : 'Disconnected');
  };

  // Update status when connection changes
  useEffect(() => {
    if (!isConnected) {
      stopAudio();
      setStatus('Disconnected');
    } else if (songData) {
      setStatus('Connected - Ready to play');
    } else {
      setStatus('Connected - Select a song');
    }
  }, [isConnected, songData]);

  return (
    <div className={`output-node ${!isConnected ? 'disabled' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="handle-left"
      />
      
      <div className="node-header">
        <h3>🔊 Audio Output</h3>
      </div>
      
      <div className="node-content">
        <div className="controls">
          <button 
            className="play-btn"
            onClick={playAudio}
            disabled={!isConnected || !songData || isPlaying}
          >
            ▶️ Play Loop
          </button>
          <button 
            className="stop-btn"
            onClick={stopAudio}
            disabled={!isPlaying}
          >
            ⏹️ Stop
          </button>
        </div>
        
        <div className={`status ${isPlaying ? 'playing' : isConnected ? 'connected' : 'disconnected'}`}>
          {status}
        </div>
      </div>
    </div>
  );
};

// Node types
const nodeTypes = {
  songSelect: SongSelectNode,
  output: OutputNode,
  highpassFilter: HighPassFilterNode,
  pitchshift: PitchShiftNode,
};

// Initial nodes - only song select and output
const initialNodes = [
  {
    id: '1',
    type: 'songSelect',
    position: { x: 100, y: 100 },
    data: {
      onSelectionChange: () => {} // Will be set in App component
    },
  },
  {
    id: '2',
    type: 'output',
    position: { x: 600, y: 100 },
    data: {
      isConnected: false,
      songData: null,
      effectChain: []
    },
  },
];

const initialEdges = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [songSelection, setSongSelection] = useState(null);
  const [filterSettings, setFilterSettings] = useState({});
  const [nextNodeId, setNextNodeId] = useState(3); // Start from 3 since we have nodes 1 and 2

  // Build effect chain by tracing connections from song select to output
  const buildEffectChain = useCallback((currentEdges, currentNodes) => {
    const chain = [];
    
    // Find the output node
    const outputNode = currentNodes.find(node => node.type === 'output');
    if (!outputNode) return chain;
    
    // Trace backwards from output to find the chain
    let currentNodeId = outputNode.id;
    const visited = new Set();
    
    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      
      // Find edge that connects to this node
      const incomingEdge = currentEdges.find(edge => edge.target === currentNodeId);
      if (!incomingEdge) break;
      
      const sourceNode = currentNodes.find(node => node.id === incomingEdge.source);
      if (!sourceNode) break;
      
      // If it's an effect node, add to chain
      if (sourceNode.type === 'highpassFilter' || sourceNode.type === 'pitchshift') {
        const filterData = filterSettings[sourceNode.id];
        if (filterData) {
          chain.unshift(filterData); // Add to beginning to maintain order
        }
      }
      
      currentNodeId = sourceNode.id;
    }
    
    return chain;
  }, [filterSettings]);

  const updateOutputNode = useCallback((currentEdges, currentNodes) => {
    const effectChain = buildEffectChain(currentEdges, currentNodes);
    const outputNode = currentNodes.find(node => node.type === 'output');
    
    if (!outputNode) return currentNodes;
    
    // Check if output is connected to anything
    const hasConnection = currentEdges.some(edge => edge.target === outputNode.id);
    
    return currentNodes.map(node => {
      if (node.id === outputNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            isConnected: hasConnection,
            songData: hasConnection ? songSelection : null,
            effectChain: effectChain
          }
        };
      }
      return node;
    });
  }, [buildEffectChain, songSelection]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      
      // Update nodes based on new connections
      setNodes(currentNodes => updateOutputNode(newEdges, currentNodes));
    },
    [edges, setEdges, setNodes, updateOutputNode]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete) => {
      // Update nodes based on remaining connections
      setNodes(currentNodes => updateOutputNode(edges, currentNodes));
    },
    [setNodes, edges, updateOutputNode]
  );

  // Handle song selection changes
  const handleSelectionChange = useCallback((selection) => {
    setSongSelection(selection);
    
    // Update output node with new song data
    setNodes(currentNodes => updateOutputNode(edges, currentNodes));
  }, [setNodes, updateOutputNode, edges]);

  // Handle filter changes
  const handleFilterChange = useCallback((nodeId, filterData) => {
    setFilterSettings(prev => ({
      ...prev,
      [nodeId]: filterData
    }));
    
    // Update output node with new effect chain
    setNodes(currentNodes => updateOutputNode(edges, currentNodes));
  }, [setFilterSettings, setNodes, updateOutputNode, edges]);

  // Update nodes with callbacks
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'songSelect') {
          return {
            ...node,
            data: {
              ...node.data,
              onSelectionChange: handleSelectionChange
            }
          };
        }
        if (node.type === 'highpassFilter' || node.type === 'pitchshift') {
          return {
            ...node,
            data: {
              ...node.data,
              onFilterChange: (filterData) => handleFilterChange(node.id, filterData)
            }
          };
        }
        return node;
      })
    );
  }, [setNodes, handleSelectionChange, handleFilterChange]);

  // Function to add a new node to the workspace
  const addNode = useCallback((nodeType) => {
    const newNodeId = nextNodeId.toString();
    
    // Calculate position - place new nodes in the middle area
    const baseX = 350;
    const baseY = 100;
    const offset = (nextNodeId - 3) * 150; // Offset each new node
    
    const newNode = {
      id: newNodeId,
      type: nodeType,
      position: { x: baseX, y: baseY + offset },
      data: {
        onFilterChange: (filterData) => handleFilterChange(newNodeId, filterData)
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNextNodeId(prev => prev + 1);
  }, [nextNodeId, setNodes, handleFilterChange]);

  // Button handlers
  const addHighPassFilter = () => addNode('highpassFilter');
  const addPitchShift = () => addNode('pitchshift');

  return (
    <div className="App">
      {/* Sticky buttons */}
      <div className="sticky-buttons">
        <button
          className="add-node-btn high-pass-btn"
          onClick={addHighPassFilter}
          title="Add High Pass Filter"
        >
          🎛️ High Pass Filter
        </button>
        <button
          className="add-node-btn pitch-shift-btn"
          onClick={addPitchShift}
          title="Add Pitch Shift"
        >
          🎵 Adjust Pitch
        </button>
      </div>
      
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;