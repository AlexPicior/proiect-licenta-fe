import React from 'react'
import { Handle, Position } from '@xyflow/react';
import {
    CaretRightOutlined
} from '@ant-design/icons';

const StartNode = () => {
  return (
    <div>
        <div 
            className="h-[9vh] w-[9vh] flex items-center justify-center bg-white rounded-full shadow border border-gray-500 hover:shadow-lg transition-shadow duration-300"
        >
            <CaretRightOutlined 
                style={{
                    color: "#47fa00"
                }}
             />
        </div>
        <Handle
            type="source"
            position={Position.Right}
            isConnectable={true}
        />
    </div>
  )
}

export default StartNode