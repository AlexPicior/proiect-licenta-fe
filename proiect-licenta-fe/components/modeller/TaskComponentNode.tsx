import React, { 
    useState
  } from 'react'
import TaskComponent from './TaskComponent'
import { 
    Handle, 
    Position,
    useReactFlow,
    NodeProps
} from '@xyflow/react';
import {
    CloseOutlined, 
    CheckOutlined
} from '@ant-design/icons';
import { Task } from './modellerTypes';

const TaskComponentNode = (props: NodeProps) => {
    const { setNodes } = useReactFlow();
    const [properties, setProperties] = useState({});

    const { id, data } = props;
    const task = (data.task as Task);
    const showDrawer: any = data.showDrawer
    const setTaskIdForDrawer: any = data.setTaskIdForDrawer;
    return (
        <div 
            className="relative group" 
            onClick={() => {
                showDrawer()
                setTaskIdForDrawer(id)
            }}
        >
            <Handle
                type="target"
                position={Position.Left}
                isConnectable={true}
            />
            <button
                onClick={(event) => {
                    event.stopPropagation();
                    setNodes((nodes) => nodes.filter((node) => node.id !== id));
                }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 z-10 
                        w-6 h-6 flex items-center justify-center"
            >
                <CloseOutlined className="text-gray-400" />
            </button>
            <TaskComponent task={task}></TaskComponent>
            {task.type === "approvalTask" || task.type === "conditionalTask" ? (
                <>
                    <CheckOutlined 
                        className='absolute top-[22%] right-[5px]' 
                        style={{
                            color: "#47fa00"
                        }}
                    ></CheckOutlined>
                    <CloseOutlined 
                        className='absolute top-[62%] right-[5px]'
                        style={{
                            color: "#fa0000"
                        }}
                    ></CloseOutlined>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="yes"
                        style={{ top: "30%" }}
                        isConnectable={true}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="no"
                        style={{ top: "70%" }}
                        isConnectable={true}
                    />
                </>
            ) : (
                <Handle
                    type="source"
                    position={Position.Right}
                    isConnectable={true}
                />
            )}
            
        </div>
    )
}

export default TaskComponentNode