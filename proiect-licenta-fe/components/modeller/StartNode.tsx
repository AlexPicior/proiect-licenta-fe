import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
    CaretRightOutlined
} from '@ant-design/icons';

const StartNode = (props: NodeProps) => {
    const { id, data } = props;
    const showDrawer: any = data.showDrawer
    const setTaskIdForDrawer: any = data.setTaskIdForDrawer;
    return (
        <div 
            onClick={() => {
            showDrawer()
            setTaskIdForDrawer(id)
            }}
        >
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