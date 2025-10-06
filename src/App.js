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

// Low Pass Filter Node Component
const LowPassFilterNode = ({ data, isConnectable }) => {
  const [frequency, setFrequency] = useState(1000);

  const handleFrequencyChange = (e) => {
    const newFreq = parseInt(e.target.value);
    setFrequency(newFreq);
    
    // Update the filter data
    if (data.onFilterChange) {
      data.onFilterChange({
        type: 'lowpass',
        frequency: newFreq
      });
    }
  };

  return (
    <div className="lowpass-filter-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="handle-left"
      />
      
      <div className="node-header">
        <h3>🔽 Low Pass Filter</h3>
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

// Delay Node Component
const DelayNode = ({ data, isConnectable }) => {
  const [delayTime, setDelayTime] = useState(0.25);
  const [feedback, setFeedback] = useState(0.3);

  const handleDelayTimeChange = (e) => {
    const newDelayTime = parseFloat(e.target.value);
    setDelayTime(newDelayTime);
    
    // Update the delay data
    if (data.onFilterChange) {
      data.onFilterChange({
        type: 'delay',
        delayTime: newDelayTime,
        feedback: feedback
      });
    }
  };

  const handleFeedbackChange = (e) => {
    const newFeedback = parseFloat(e.target.value);
    setFeedback(newFeedback);
    
    // Update the delay data
    if (data.onFilterChange) {
      data.onFilterChange({
        type: 'delay',
        delayTime: delayTime,
        feedback: newFeedback
      });
    }
  };

  return (
    <div className="delay-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="handle-left"
      />
      
      <div className="node-header">
        <h3>🔄 Delay</h3>
      </div>
      
      <div className="node-content">
        <div className="filter-control">
          <label>Delay Time: {delayTime}s</label>
          <input
            type="range"
            min="0.01"
            max="1.0"
            step="0.01"
            value={delayTime}
            onChange={handleDelayTimeChange}
            className="delay-slider"
          />
          <div className="frequency-labels">
            <span>0.01s</span>
            <span>1.0s</span>
          </div>
        </div>
        
        <div className="filter-control">
          <label>Feedback: {Math.round(feedback * 100)}%</label>
          <input
            type="range"
            min="0"
            max="0.95"
            step="0.01"
            value={feedback}
            onChange={handleFeedbackChange}
            className="feedback-slider"
          />
          <div className="frequency-labels">
            <span>0%</span>
            <span>95%</span>
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

// Reverb Node Component
const ReverbNode = ({ data, isConnectable }) => {
  const [roomSize, setRoomSize] = useState(0.7);
  const [decay, setDecay] = useState(1.5);

  const handleRoomSizeChange = (e) => {
    const newRoomSize = parseFloat(e.target.value);
    setRoomSize(newRoomSize);
    
    // Update the reverb data
    if (data.onFilterChange) {
      data.onFilterChange({
        type: 'reverb',
        roomSize: newRoomSize,
        decay: decay
      });
    }
  };

  const handleDecayChange = (e) => {
    const newDecay = parseFloat(e.target.value);
    setDecay(newDecay);
    
    // Update the reverb data
    if (data.onFilterChange) {
      data.onFilterChange({
        type: 'reverb',
        roomSize: roomSize,
        decay: newDecay
      });
    }
  };

  return (
    <div className="reverb-node">
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="handle-left"
      />
      
      <div className="node-header">
        <h3>🏛️ Reverb</h3>
      </div>
      
      <div className="node-content">
        <div className="filter-control">
          <label>Room Size: {Math.round(roomSize * 100)}%</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.01"
            value={roomSize}
            onChange={handleRoomSizeChange}
            className="roomsize-slider"
          />
          <div className="frequency-labels">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="filter-control">
          <label>Decay: {decay.toFixed(1)}s</label>
          <input
            type="range"
            min="0.1"
            max="10.0"
            step="0.1"
            value={decay}
            onChange={handleDecayChange}
            className="decay-slider"
          />
          <div className="frequency-labels">
            <span>0.1s</span>
            <span>10s</span>
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
  const [bpm, setBpm] = useState(120);

  const isConnected = data.isConnected;
  const songData = data.songData;
  const effectChain = data.effectChain || [];

  const handleBpmChange = (e) => {
    const newBpm = parseInt(e.target.value);
    setBpm(newBpm);
    
    // Update ToneJS Transport immediately if available
    if (window.Tone && window.Tone.Transport) {
      window.Tone.Transport.bpm.value = newBpm;
    }
  };

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

      // Set the BPM and start Transport
      Tone.Transport.bpm.value = bpm;
      
      // Stop any existing player and dispose of chain
      if (currentPlayer) {
        currentPlayer.stop();
        currentPlayer.dispose();
      }
      
      // Stop and clear Transport
      Tone.Transport.stop();
      Tone.Transport.cancel();
      
      // Dispose of existing effect chain
      currentChain.forEach(effect => {
        if (effect && effect.dispose) {
          effect.dispose();
        }
      });

      // Calculate playback rate based on BPM (120 BPM is normal speed)
      const baseBpm = 120;
      const playbackRate = bpm / baseBpm;
      
      // Create new player with adjusted playback rate
      const player = new Tone.Player({
        url: songData.audioUrl,
        loop: false, // We'll handle looping with Transport
        autostart: false,
        playbackRate: playbackRate
      });

      // Create effect chain
      const effects = [];
      effectChain.forEach(effectData => {
        if (effectData.type === 'highpass') {
          const filter = new Tone.Filter(effectData.frequency, 'highpass');
          effects.push(filter);
        } else if (effectData.type === 'lowpass') {
          const filter = new Tone.Filter(effectData.frequency, 'lowpass');
          effects.push(filter);
        } else if (effectData.type === 'delay') {
          const delay = new Tone.Delay(effectData.delayTime);
          delay.feedback.value = effectData.feedback;
          effects.push(delay);
        } else if (effectData.type === 'reverb') {
          const reverb = new Tone.Reverb({
            decay: effectData.decay,
            roomSize: effectData.roomSize
          });
          effects.push(reverb);
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

      // Calculate loop duration based on original BPM and adjusted for playback rate
      const beatsPerBar = 4;
      const originalBarDuration = (60 / baseBpm) * beatsPerBar; // Original duration at 120 BPM
      const adjustedBarDuration = originalBarDuration / playbackRate; // Adjusted for new BPM
      
      // Schedule the player to loop using Transport
      Tone.Transport.scheduleRepeat((time) => {
        player.start(time);
      }, adjustedBarDuration);

      // Start Transport
      Tone.Transport.start();
      
      setCurrentPlayer(player);
      setIsPlaying(true);
      
      const effectsText = effectChain.length > 0
        ? ` with ${effectChain.length} effect(s)`
        : '';
      setStatus(`Playing: ${songData.sound.name}${effectsText} at ${bpm} BPM (looping)`);

    } catch (error) {
      console.error('Error playing audio:', error);
      setStatus('Error playing audio');
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    // Stop Transport
    if (window.Tone && window.Tone.Transport) {
      window.Tone.Transport.stop();
      window.Tone.Transport.cancel();
    }
    
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
        
        <div className="bpm-control">
          <label>Tempo: {bpm} BPM</label>
          <input
            type="range"
            min="60"
            max="200"
            step="1"
            value={bpm}
            onChange={handleBpmChange}
            className="bpm-slider"
            disabled={isPlaying}
          />
          <div className="frequency-labels">
            <span>60 BPM</span>
            <span>200 BPM</span>
          </div>
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
  lowpassFilter: LowPassFilterNode,
  delay: DelayNode,
  reverb: ReverbNode,
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
      if (sourceNode.type === 'highpassFilter' || sourceNode.type === 'lowpassFilter' || sourceNode.type === 'delay' || sourceNode.type === 'reverb' || sourceNode.type === 'pitchshift') {
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
      // Filter out the deleted edges to get the remaining connections
      const edgeIdsToDelete = edgesToDelete.map(edge => edge.id);
      const remainingEdges = edges.filter(edge => !edgeIdsToDelete.includes(edge.id));
      
      // Update nodes based on remaining connections
      setNodes(currentNodes => updateOutputNode(remainingEdges, currentNodes));
    },
    [setNodes, edges, updateOutputNode]
  );

  // Handle song selection changes
  const handleSelectionChange = useCallback((selection) => {
    setSongSelection(selection);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((nodeId, filterData) => {
    setFilterSettings(prev => ({
      ...prev,
      [nodeId]: filterData
    }));
  }, []);


  // Centralized effect to update output node whenever relevant state changes
  useEffect(() => {
    setNodes(currentNodes => updateOutputNode(edges, currentNodes));
  }, [edges, songSelection, filterSettings, updateOutputNode]);

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
        if (node.type === 'highpassFilter' || node.type === 'lowpassFilter' || node.type === 'delay' || node.type === 'reverb' || node.type === 'pitchshift') {
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
  const addLowPassFilter = () => addNode('lowpassFilter');
  const addDelay = () => addNode('delay');
  const addReverb = () => addNode('reverb');
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
          className="add-node-btn low-pass-btn"
          onClick={addLowPassFilter}
          title="Add Low Pass Filter"
        >
          🔽 Low Pass Filter
        </button>
        <button
          className="add-node-btn delay-btn"
          onClick={addDelay}
          title="Add Delay"
        >
          🔄 Delay
        </button>
        <button
          className="add-node-btn reverb-btn"
          onClick={addReverb}
          title="Add Reverb"
        >
          🏛️ Reverb
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