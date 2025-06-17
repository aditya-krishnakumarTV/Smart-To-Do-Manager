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

// Angular 18 enhanced interfaces
export interface TaskStatistics {
    total: number;
    active: number;
    completed: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    totalTags: number;
}

export interface TaskExportData {
    tasks: Task[];
    exportDate: Date;
    version: string;
}

export interface BulkTaskOperation {
    taskIds: string[];
    operation: 'complete' | 'delete' | 'update';
    updates?: Partial<Task>;
}