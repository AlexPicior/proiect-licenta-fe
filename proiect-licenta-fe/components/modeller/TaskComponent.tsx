import React from 'react'
import { TaskProps, Task } from './modellerTypes';

const onDragStart = (event: any, task: Task) => {
    event.dataTransfer.setData("task", JSON.stringify(task));
    event.dataTransfer.effectAllowed = "move";
};

const TaskComponent: React.FC<TaskProps> = ({ task }) => {
    return (
        <div 
            className="h-fit min-h-[12vh] w-[12vw] p-4 flex items-center justify-center bg-white rounded-lg shadow border border-gray-500 hover:shadow-lg transition-shadow duration-300"
            draggable
            onDragStart={(event) => onDragStart(event, task)}
        >
            <p className="text-gray-800 font-medium text-center">{task.label}</p>
        </div>
    )
}

export default TaskComponent