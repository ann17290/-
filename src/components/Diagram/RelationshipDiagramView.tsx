import React, { useState, useRef, useEffect } from 'react';
import { NovelProject, DiagramNode, DiagramEdge } from '../../types/novel';
import { 
  Network, 
  Plus, 
  Trash2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Heart, 
  ShieldAlert, 
  Sparkles,
  Link,
  X
} from 'lucide-react';

interface RelationshipDiagramViewProps {
  project: NovelProject;
  onUpdateProject: (updated: NovelProject) => void;
}

export const RelationshipDiagramView: React.FC<RelationshipDiagramViewProps> = ({
  project,
  onUpdateProject,
}) => {
  const [nodes, setNodes] = useState<DiagramNode[]>(project.diagramNodes);
  const [edges, setEdges] = useState<DiagramEdge[]>(project.diagramEdges);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas pan & zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected node for info drawer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Add edge modal state
  const [showAddEdgeModal, setShowAddEdgeModal] = useState(false);
  const [edgeSourceId, setEdgeSourceId] = useState('');
  const [edgeTargetId, setEdgeTargetId] = useState('');
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeSentiment, setEdgeSentiment] = useState<'positive' | 'negative' | 'neutral' | 'complex'>('positive');

  // Add node modal state
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeType, setNodeType] = useState<'character' | 'event' | 'location'>('character');
  const [nodeDesc, setNodeDesc] = useState('');
  const [nodeCharId, setNodeCharId] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state if project changes from outside
  useEffect(() => {
    setNodes(project.diagramNodes);
    setEdges(project.diagramEdges);
  }, [project.diagramNodes, project.diagramEdges]);

  // Handle node drag start
  const handleNodeMouseDown = (e: React.MouseEvent, node: DiagramNode) => {
    e.stopPropagation();
    setDraggingNodeId(node.id);
    setSelectedNodeId(node.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate mouse position relative to canvas
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y,
    });
  };

  // Canvas Mouse Move (Drag node or Pan)
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (draggingNodeId) {
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      const newX = Math.round(mouseX - dragOffset.x);
      const newY = Math.round(mouseY - dragOffset.y);

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  // Drag End
  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      // Persist node positions
      onUpdateProject({
        ...project,
        diagramNodes: nodes,
        diagramEdges: edges,
        updatedAt: new Date().toISOString(),
      });
    }
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Canvas Pan start
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
      setSelectedNodeId(null);
    }
  };

  // Add Edge
  const handleAddEdge = () => {
    if (!edgeSourceId || !edgeTargetId || !edgeLabel.trim()) return;
    const newEdge: DiagramEdge = {
      id: `edge-${Date.now()}`,
      from: edgeSourceId,
      to: edgeTargetId,
      label: edgeLabel,
      sentiment: edgeSentiment,
    };
    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);
    onUpdateProject({
      ...project,
      diagramEdges: updatedEdges,
      updatedAt: new Date().toISOString(),
    });
    setShowAddEdgeModal(false);
    setEdgeLabel('');
  };

  // Delete Edge
  const handleDeleteEdge = (edgeId: string) => {
    const updated = edges.filter(e => e.id !== edgeId);
    setEdges(updated);
    onUpdateProject({
      ...project,
      diagramEdges: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Node
  const handleAddNode = () => {
    if (!nodeTitle.trim()) return;
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      title: nodeTitle,
      type: nodeType,
      x: 350 - pan.x,
      y: 250 - pan.y,
      description: nodeDesc,
      characterId: nodeType === 'character' ? nodeCharId : undefined,
      color: nodeType === 'character' ? '#0284c7' : nodeType === 'event' ? '#d97706' : '#15803d',
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onUpdateProject({
      ...project,
      diagramNodes: updatedNodes,
      updatedAt: new Date().toISOString(),
    });
    setShowAddNodeModal(false);
    setNodeTitle('');
    setNodeDesc('');
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    const updatedEdges = edges.filter(e => e.from !== nodeId && e.to !== nodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    onUpdateProject({
      ...project,
      diagramNodes: updatedNodes,
      diagramEdges: updatedEdges,
      updatedAt: new Date().toISOString(),
    });
    setSelectedNodeId(null);
  };

  // Reset positions to default
  const handleResetLayout = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-950 text-stone-100 overflow-hidden relative select-none">
      {/* Top Toolbar */}
      <div className="h-12 border-b border-stone-800 bg-stone-950/90 backdrop-blur px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-xs text-stone-200 font-serif-thai">
            แผนผังความสัมพันธ์ตัวละคร & ไทม์ไลน์เหตุการณ์
          </h2>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            (สามารถคลิกลากย้ายโหนด แพนภาพ หรือกดเพิ่มเส้นความสัมพันธ์ได้)
          </span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>เพิ่มโหนด</span>
          </button>

          <button
            onClick={() => {
              if (nodes.length < 2) {
                alert('ต้องมีอย่างน้อย 2 โหนดเพื่อสร้างความสัมพันธ์');
                return;
              }
              setEdgeSourceId(nodes[0].id);
              setEdgeTargetId(nodes[1].id);
              setShowAddEdgeModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-md transition-colors"
          >
            <Link className="w-3.5 h-3.5" />
            <span>เชื่อมความสัมพันธ์</span>
          </button>

          <div className="flex items-center bg-stone-900 border border-stone-800 rounded-md p-0.5 ml-2">
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-1 text-stone-400 hover:text-stone-200"
              title="ย่อขนาด"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-stone-400 px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(2, z + 0.15))}
              className="p-1 text-stone-400 hover:text-stone-200"
              title="ขยายขนาด"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetLayout}
              className="p-1 text-stone-400 hover:text-stone-200 border-l border-stone-800"
              title="รีเซ็ตมุมมอง"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px]"
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Draw connecting edges */}
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.from);
            const targetNode = nodes.find(n => n.id === edge.to);
            if (!sourceNode || !targetNode) return null;

            // Compute center coords (assuming node width ~180, height ~70)
            const sx = sourceNode.x + 90;
            const sy = sourceNode.y + 35;
            const tx = targetNode.x + 90;
            const ty = targetNode.y + 35;

            // Midpoint for label
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2;

            // Curve control point offset
            const dx = tx - sx;
            const dy = ty - sy;
            const cx = mx - dy * 0.15;
            const cy = my + dx * 0.15;

            const strokeColor = edge.sentiment === 'positive' 
              ? '#10b981' 
              : edge.sentiment === 'negative' 
              ? '#f43f5e' 
              : '#f59e0b';

            return (
              <g key={edge.id} className="pointer-events-auto group">
                {/* Curve path */}
                <path
                  d={`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  strokeOpacity={0.65}
                  strokeDasharray={edge.sentiment === 'negative' ? '6,4' : undefined}
                  className="transition-all hover:stroke-amber-300"
                />

                {/* Arrow or Midpoint Label */}
                <foreignObject
                  x={cx - 70}
                  y={cy - 12}
                  width={140}
                  height={24}
                  className="overflow-visible"
                >
                  <div
                    className="flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-md border backdrop-blur transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: 'rgba(23, 23, 23, 0.9)',
                      borderColor: strokeColor,
                      color: strokeColor,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`ต้องการลบความสัมพันธ์ "${edge.label}" หรือไม่?`)) {
                        handleDeleteEdge(edge.id);
                      }
                    }}
                    title="คลิกเพื่อลบเส้นนี้"
                  >
                    <span>{edge.label}</span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* HTML Draggable Nodes Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {nodes.map(node => {
            const isSelected = node.id === selectedNodeId;
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                style={{
                  transform: `translate(${node.x}px, ${node.y}px)`,
                  width: '180px',
                }}
                className={`absolute pointer-events-auto p-3 rounded-xl border bg-stone-900/95 backdrop-blur-md shadow-lg cursor-move select-none transition-shadow ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-amber-950/50'
                    : 'border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: node.color || '#0284c7' }}
                    />
                    <h4 className="font-semibold text-xs text-stone-100 font-sans-thai truncate max-w-[120px]">
                      {node.title}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="text-stone-500 hover:text-rose-400 p-0.5 rounded"
                    title="ลบโหนดนี้"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {node.description && (
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                    {node.description}
                  </p>
                )}

                <div className="mt-2 pt-1 border-t border-stone-800/80 flex items-center justify-between text-[9px] text-stone-500 uppercase">
                  <span>{node.type === 'character' ? 'ตัวละคร' : node.type === 'event' ? 'เหตุการณ์' : 'สถานที่'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Side Card */}
      {selectedNode && (
        <div className="absolute right-4 bottom-4 z-30 w-72 bg-stone-900/95 border border-stone-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="font-semibold text-amber-300 font-serif-thai text-sm">{selectedNode.title}</span>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-stone-300 text-xs leading-relaxed font-sans-thai">
            {selectedNode.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
          </p>
          <div className="pt-2 text-[10px] text-stone-500 flex justify-between">
            <span>ประเภท: {selectedNode.type}</span>
            <span>พิกัด: {selectedNode.x}, {selectedNode.y}</span>
          </div>
        </div>
      )}

      {/* Add Edge Modal */}
      {showAddEdgeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl text-xs">
            <h3 className="font-semibold text-stone-100 font-serif-thai text-base">เชื่อมโยงเส้นความสัมพันธ์</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">จากตัวละคร/โหนด:</label>
                  <select
                    value={edgeSourceId}
                    onChange={(e) => setEdgeSourceId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">ไปยังตัวละคร/โหนด:</label>
                  <select
                    value={edgeTargetId}
                    onChange={(e) => setEdgeTargetId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">ป้ายระบุความสัมพันธ์:*</label>
                <input
                  type="text"
                  value={edgeLabel}
                  onChange={(e) => setEdgeLabel(e.target.value)}
                  placeholder="เช่น คนรัก, คู่ปรับตลอดกาล, ศิษย์กตัญญู, ผู้ชักใยลับ"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">ลักษณะความสัมพันธ์ (Sentiment):</label>
                <select
                  value={edgeSentiment}
                  onChange={(e) => setEdgeSentiment(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="positive">ด้านบวก / รัก / พันธมิตร (สีเขียว)</option>
                  <option value="negative">ด้านลบ / ศัตรู / ความแค้น (สีแดง)</option>
                  <option value="complex">ซับซ้อน / ก้ำกึ่ง / ผลประโยชน์ (สีทอง)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddEdgeModal(false)}
                className="px-3 py-1.5 text-stone-400 hover:text-stone-200 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddEdge}
                disabled={!edgeLabel.trim() || edgeSourceId === edgeTargetId}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                สร้างเส้นเชื่อมโยง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl text-xs">
            <h3 className="font-semibold text-stone-100 font-serif-thai text-base">เพิ่มโหนดในแผนผัง</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-stone-400 mb-1">ประเภทโหนด:</label>
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="character">ตัวละคร (Character)</option>
                  <option value="event">เหตุการณ์ / จุดเปลี่ยน (Plot Event)</option>
                  <option value="location">สถานที่ / ดินแดน (Location)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">ชื่อโหนด:*</label>
                <input
                  type="text"
                  value={nodeTitle}
                  onChange={(e) => setNodeTitle(e.target.value)}
                  placeholder="เช่น มหาศึกสะพานแขวน, องค์หญิงแปด"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">คำอธิบายย่อ:</label>
                <textarea
                  value={nodeDesc}
                  onChange={(e) => setNodeDesc(e.target.value)}
                  placeholder="บทบาทหรือความสำคัญในโครงเรื่อง..."
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-400 resize-none font-sans-thai"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddNodeModal(false)}
                className="px-3 py-1.5 text-stone-400 hover:text-stone-200 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddNode}
                disabled={!nodeTitle.trim()}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                เพิ่มโหนด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
