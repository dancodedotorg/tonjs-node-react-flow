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

// Output Node Component
const OutputNode = ({ data, isConnectable }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [status, setStatus] = useState('Disconnected');

  const isConnected = data.isConnected;
  const songData = data.songData;

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

      // Stop any existing player
      if (currentPlayer) {
        currentPlayer.stop();
        currentPlayer.dispose();
      }

      // Create new player
      const player = new Tone.Player({
        url: songData.audioUrl,
        loop: true,
        autostart: false
      }).toDestination();

      // Wait for buffer to load
      await Tone.loaded();

      // Start playback
      player.start();
      setCurrentPlayer(player);
      setIsPlaying(true);
      setStatus(`Playing: ${songData.sound.name} (looping)`);

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
};

// Initial nodes
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
    position: { x: 500, y: 100 },
    data: { 
      isConnected: false,
      songData: null
    },
  },
];

const initialEdges = [];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [songSelection, setSongSelection] = useState(null);

  const onConnect = useCallback(
    (params) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);
      
      // Update output node to be connected
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '2') {
            return {
              ...node,
              data: {
                ...node.data,
                isConnected: true,
                songData: songSelection
              }
            };
          }
          return node;
        })
      );
    },
    [edges, setEdges, setNodes, songSelection]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete) => {
      // Update output node to be disconnected
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '2') {
            return {
              ...node,
              data: {
                ...node.data,
                isConnected: false,
                songData: null
              }
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Handle song selection changes
  const handleSelectionChange = useCallback((selection) => {
    setSongSelection(selection);
    
    // Update output node with new song data if connected
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '2' && node.data.isConnected) {
          return {
            ...node,
            data: {
              ...node.data,
              songData: selection
            }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Update song select node with callback
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return {
            ...node,
            data: {
              ...node.data,
              onSelectionChange: handleSelectionChange
            }
          };
        }
        return node;
      })
    );
  }, [setNodes, handleSelectionChange]);

  return (
    <div className="App">
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