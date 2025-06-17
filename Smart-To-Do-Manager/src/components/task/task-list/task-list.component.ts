import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

import { Task, Priority } from '../../../interfaces/task.interface';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrl: './task-list.component.css',
    standalone: true
})
export class TaskListComponent {
    @Input() tasks: Task[] = [];
    @Input() emptyMessage = 'Start by creating your first task above!';
    @Output() taskToggled = new EventEmitter<string>();
    @Output() taskDeleted = new EventEmitter<string>();
    @Output() taskEdited = new EventEmitter<Task>();

    // Angular 18 signals for component state
    private deletingTaskId = signal<string | null>(null);

    trackByTaskId(index: number, task: Task): string {
        return task.id;
    }

    trackByTag(index: number, tag: string): string {
        return tag;
    }

    getTaskClasses(task: Task): string {
        const classes = [`priority-${task.priority}`];
        if (task.completed) {
            classes.push('completed');
        }
        return classes.join(' ');
    }

    getPriorityLabel(priority: Priority): string {
        switch (priority) {
            case Priority.HIGH:
                return 'High';
            case Priority.MEDIUM:
                return 'Medium';
            case Priority.LOW:
                return 'Low';
            default:
                return 'Medium';
        }
    }

    formatDate(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) {
            return 'Just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    formatDateForScreenReader(date: Date): string {
        return date.toLocaleString();
    }

    onToggleTask(taskId: string): void {
        this.taskToggled.emit(taskId);
    }

    onDeleteTask(taskId: string): void {
        if (this.deletingTaskId() === taskId) {
            return; // Prevent double-clicking
        }

        if (confirm('Are you sure you want to delete this task?')) {
            this.deletingTaskId.set(taskId);

            // Add a small delay to prevent accidental double-clicks
            setTimeout(() => {
                this.taskDeleted.emit(taskId);
                this.deletingTaskId.set(null);
            }, 100);
        }
    }

    onEditTask(task: Task): void {
        this.taskEdited.emit(task);
    }
}