import React from 'react'
import { Handle, Position } from '@xyflow/react';
import {
    StopOutlined
} from '@ant-design/icons';

const EndNode = () => {
  return (
    <div>
        <Handle
            type="target"
            position={Position.Left}
            isConnectable={true}
        />
        <div 
            className="h-[9vh] w-[9vh] flex items-center justify-center bg-white rounded-full shadow border border-gray-500 hover:shadow-lg transition-shadow duration-300"
        >
            <StopOutlined 
                style={{
                    color: "#fa0000"
                }}
            />
        </div>
    </div>
  )
}

export default EndNode