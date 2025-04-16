import React from 'react'
import {
  BezierEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import {
  CloseOutlined
} from '@ant-design/icons';

const EdgeComponent = (props: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition
  });
 
  return (
    <>
      <BezierEdge {...props} />
      <EdgeLabelRenderer>
        <button
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          onClick={() => {
            setEdges((es) => es.filter((e) => e.id !== id));
          }}
          className=" bg-white rounded-full w-6 h-6 relative"
        >
            <CloseOutlined className="text-gray-400" />
        </button>
      </EdgeLabelRenderer>
    </>
  )
}

export default EdgeComponent