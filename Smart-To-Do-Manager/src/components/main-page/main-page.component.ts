import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

import { Task, TaskFilter } from "../../interfaces/task.interface";

import { TaskService } from "../../services/task.service";
import { ThemeService } from "../../services/theme.service";

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.css',
    standalone: true,
    imports: [CommonModule],
})
export class MainPageComponent implements OnInit {
    tasks: Task[] = [];
    filteredTasks: Task[] = [];
    editingTask: Task | null = null;
    isDarkMode = false;
    availableTags: string[] = [];
    currentFilter: TaskFilter = {};

    constructor(
        private taskService: TaskService,
        private themeService: ThemeService
    ) { }

    ngOnInit(): void {
        this.taskService.tasks$.subscribe(tasks => {
            this.tasks = tasks;
            this.availableTags = this.taskService.getAllTags();
            this.applyFilters();
        });

        this.themeService.isDarkMode$.subscribe(isDark => {
            this.isDarkMode = isDark;
        });
    }

    get activeTasks(): number {
        return this.tasks.filter(task => !task.completed).length;
    }

    get completedTasks(): number {
        return this.tasks.filter(task => task.completed).length;
    }

    onTaskSubmitted(taskData: any): void {
        if (this.editingTask) {
            this.taskService.updateTask(this.editingTask.id, taskData);
            this.editingTask = null;
        } else {
            this.taskService.addTask(
                taskData.title,
                taskData.description,
                taskData.priority,
                taskData.tags
            );
        }
    }

    onTaskToggled(taskId: string): void {
        this.taskService.toggleTask(taskId);
    }

    onTaskDeleted(taskId: string): void {
        this.taskService.deleteTask(taskId);
        if (this.editingTask && this.editingTask.id === taskId) {
            this.editingTask = null;
        }
    }

    onTaskEdited(task: Task): void {
        this.editingTask = task;
    }

    cancelEdit(): void {
        this.editingTask = null;
    }

    onFiltersChange(filter: TaskFilter): void {
        this.currentFilter = filter;
        this.applyFilters();
    }

    private applyFilters(): void {
        this.filteredTasks = this.taskService.filterTasks(this.currentFilter);
    }

    getEmptyMessage(): string {
        if (Object.keys(this.currentFilter).length > 0) {
            return 'No tasks match your current filters.';
        }
        return 'Start by creating your first task above!';
    }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }
}