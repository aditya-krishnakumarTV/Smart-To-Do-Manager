export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    tags: string[];
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export interface TaskFilter {
    search?: string;
    priority?: Priority;
    tags?: string[];
    completed?: boolean;
}